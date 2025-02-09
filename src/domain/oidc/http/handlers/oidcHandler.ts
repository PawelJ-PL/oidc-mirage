import type { ParameterizedContext } from 'koa'
import type { OidcService, TokenResult } from '../../service/oidcService'
import type { AppConfig } from '../../../../common/config/appConfig'
import type { Logger } from 'pino'
import { oidcAuthenticationRequestParamsSchema } from '../../types/oidcAuthenticationRequestParams'
import { tokenRequestSchema } from '../../types/tokenRequest'

export type OidcHandlerDeps = {
    logger: Logger
    oidcService: OidcService
    appConfig: AppConfig
}

const getBaseUrl = (appConfig: AppConfig, ctx: ParameterizedContext) => {
    if (appConfig.BASE_URL) {
        return appConfig.BASE_URL
    }

    const proto = ctx.request.headers['x-forwarded-proto'] || ctx.request.protocol
    const host = ctx.request.headers['x-forwarded-host'] || ctx.request.headers['host'] || ctx.request.host

    return `${proto}://${host}`
}

export const createOidcDiscoveryHandler = (deps: OidcHandlerDeps) => (ctx: ParameterizedContext) => {
    const baseUrl = getBaseUrl(deps.appConfig, ctx)
    const discoveryProperties = deps.oidcService.getOidcDiscoveryParameters(baseUrl)

    ctx.body = discoveryProperties
}

const setUnauthorizedResponse = (ctx: ParameterizedContext) => {
    ctx.set('WWW-Authenticate', 'Basic realm="Secure Area"')
    ctx.status = 401
    ctx.body = 'Authentication required'
}

const extractBasicAuthCredentials = (authorizationHeader: string, logger?: Logger) => {
    const [scheme, credentials] = authorizationHeader.split(' ', 2)
    if (!credentials || scheme.toLowerCase() !== 'basic') {
        if (logger) logger.warn('Invalid authorization header')
        return undefined
    }

    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':', 2)
    if (!username || !password) {
        if (logger) logger.warn('Username or password not provided')
        return undefined
    }

    return { username, password }
}

export const createOidcAuthHandler = (deps: OidcHandlerDeps) => async (ctx: ParameterizedContext) => {
    const { logger } = deps

    const authorizationHeader = ctx.request.headers.authorization ?? ''

    const credentials = extractBasicAuthCredentials(authorizationHeader, logger)
    if (!credentials) {
        return setUnauthorizedResponse(ctx)
    }

    const paramsResult = oidcAuthenticationRequestParamsSchema.safeParse(ctx.request.query)
    if (!paramsResult.success) {
        logger.warn({ errors: paramsResult.error }, 'Invalid request parameters')
        ctx.status = 400
        ctx.body = 'Invalid request parameters'
        return ctx
    }

    const result = await deps.oidcService.authenticate(credentials, paramsResult.data, getBaseUrl(deps.appConfig, ctx))
    if (!result) {
        logger.warn({ username: credentials.username }, 'Authentication failed')
        return setUnauthorizedResponse(ctx)
    }

    ctx.redirect(result.redirectUrl)
}

export const createOidcTokenHandler = (deps: OidcHandlerDeps) => async (ctx: ParameterizedContext) => {
    const { logger } = deps

    const bodyResult = tokenRequestSchema.safeParse(ctx.request.body)
    if (!bodyResult.success) {
        logger.warn({ errors: bodyResult.error }, 'Invalid request parameters')
        ctx.status = 400
        ctx.body = 'Invalid request parameters'
        return ctx
    }

    const authBasicResult = extractBasicAuthCredentials(ctx.request.headers.authorization ?? '')
    const [client_id, client_secret] = authBasicResult
        ? [authBasicResult.username, authBasicResult.password]
        : [bodyResult.data.client_id, bodyResult.data.client_secret]

    if (!client_id || !client_secret) {
        logger.warn('Client credentials not provided')
        ctx.status = 401
        ctx.body = 'Client credentials not provided'
        return ctx
    }

    const result: TokenResult = await deps.oidcService.generateIdToken(client_id, bodyResult.data)
    if (!result.success) {
        logger.warn('Token generation failed', { error: result.error })
        ctx.status = 401
        ctx.body = result.error
        return
    }

    ctx.status = 200
    ctx.body = result.payload
}

export const createOidcJwksHandler = (deps: OidcHandlerDeps) => (ctx: ParameterizedContext) => {
    const jwks = deps.oidcService.getJwks()
    ctx.body = jwks
    ctx.status = 200
}
