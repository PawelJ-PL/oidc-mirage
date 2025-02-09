import type { Logger } from 'pino'
import type { OidcAuthenticationRequestParams } from '../types/oidcAuthenticationRequestParams'
import type { UsersRepository } from '../repository/usersRepository'
import type { IdTokenPayload } from '../types/idTokenPayload'
import { authCodePayloadSchema, type AuthCodePayload } from '../types/authCodePayload'
import type { TokenRequest } from '../types/tokenRequest'
import type { AppConfig } from '../../../common/config/appConfig'
import { SignJWT } from 'jose'

export type OidcServiceDeps = {
    logger: Logger
    usersRepository: UsersRepository
    appConfig: AppConfig
}

export type LoginCredentials = { username: string; password: string }

export type TokenResult =
    | {
          success: true
          payload: { access_token: string; token_type: string; id_token: string; expires_in: number; state?: string }
      }
    | { success: false; error: string }

export const createOidcService = (deps: OidcServiceDeps) => {
    return {
        getOidcDiscoveryParameters: (baseUrl: string) => getOidcDiscoveryParameters(baseUrl),
        authenticate: (credentials: LoginCredentials, params: OidcAuthenticationRequestParams, baseUrl: string) =>
            authenticate(deps, credentials, params, baseUrl),
        generateIdToken: (clientId: string, params: TokenRequest) => generateIdToken(deps, clientId, params),
        getJwks: () => getJwks(deps),
    }
}

export type OidcService = ReturnType<typeof createOidcService>

const getOidcDiscoveryParameters = (baseUrl: string) => ({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    jwks_uri: `${baseUrl}/jwks`,
    response_types_supported: ['code', 'id_token', 'token id_token'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    subject_types_supported: ['public'],
    grant_types_supported: ['authorization_code', 'implicit'],
    claims_supported: ['sub', 'name', 'given_name', 'family_name', 'email', 'email_verified'],
})

const authenticate = async (
    deps: OidcServiceDeps,
    credentials: LoginCredentials,
    params: OidcAuthenticationRequestParams,
    baseUrl: string,
): Promise<{ redirectUrl: string } | undefined> => {
    const { logger, usersRepository } = deps

    logger.info({ username: credentials.username }, 'Authenticating user')

    const user = await usersRepository.getByName(credentials.username)
    if (!user) {
        logger.warn({ username: credentials.username }, 'User not found')
        return undefined
    }
    if (user.password !== credentials.password) {
        logger.warn({ username: credentials.username }, 'Invalid password')
        return undefined
    }

    logger.info({ username: credentials.username }, 'User authenticated')

    if (params.response_type !== 'code') {
        logger.warn({ response_type: params.response_type }, 'Response type not implemented')
        return undefined
    }

    const tokenPayload: IdTokenPayload = {
        iss: baseUrl,
        sub: user.id,
        aud: params.client_id,
        exp: 0,
        iat: 0,
        nonce: params.nonce,
        email: user.email,
        email_verified: user.emailVerified,
        name: user.name,
        given_name: user.givenName,
        family_name: user.familyName,
    }

    const authCodePayload: AuthCodePayload = {
        tokenPayload,
        redirectUrl: params.redirect_uri,
        state: params.state,
    }

    const authCode = Buffer.from(JSON.stringify(authCodePayload)).toString('base64')

    logger.info({ username: credentials.username }, 'Authorization code generated')

    const redirectUrl = new URL(params.redirect_uri)
    redirectUrl.searchParams.set('code', authCode)
    if (params.state) {
        redirectUrl.searchParams.set('state', params.state)
    }

    return { redirectUrl: redirectUrl.toString() }
}

const generateIdToken = async (deps: OidcServiceDeps, clientId: string, params: TokenRequest): Promise<TokenResult> => {
    const { logger, appConfig } = deps

    logger.info({ clientId }, 'Generating ID token')

    let codePayload: AuthCodePayload

    try {
        const codePayloadJson = JSON.parse(Buffer.from(params.code, 'base64').toString())
        codePayload = authCodePayloadSchema.parse(codePayloadJson)
    } catch (error) {
        logger.warn('Invalid authorization code')
        logger.error(error)
        return { success: false, error: 'Invalid authorization code' }
    }

    if (codePayload.redirectUrl !== params.redirect_uri) {
        logger.warn(
            { redirectUrl: params.redirect_uri, codeRedirectUri: codePayload.redirectUrl },
            'Redirect URL mismatch',
        )
        return { success: false, error: 'Redirect URL mismatch' }
    }

    if (codePayload.tokenPayload.aud !== clientId) {
        logger.warn({ clientId, aud: codePayload.tokenPayload.aud }, 'Client ID mismatch')
        return { success: false, error: 'Client ID mismatch' }
    }

    const nowTimestamp = Math.floor(Date.now() / 1000)

    const idTokenPayload: IdTokenPayload = {
        ...codePayload.tokenPayload,
        exp: nowTimestamp + appConfig.TOKEN_TTL_SECONDS,
        iat: nowTimestamp,
    }

    const token = await new SignJWT(idTokenPayload)
        .setProtectedHeader({ alg: 'RS256', kid: appConfig.TOKEN_SIGNING_KEY_ID })
        .sign(appConfig.TOKEN_SIGNING_KEY)

    logger.info({ clientId }, 'ID token generated')

    return {
        success: true,
        payload: {
            access_token: 'foo-bar',
            token_type: 'Bearer',
            id_token: token,
            expires_in: appConfig.TOKEN_TTL_SECONDS,
        },
    }
}

const getJwks = (deps: OidcServiceDeps) => {
    return {
        keys: [
            {
                ...deps.appConfig.TOKEN_SIGNING_PUBLIC_KEY_JWK,
                kid: deps.appConfig.TOKEN_SIGNING_KEY_ID,
            },
        ],
    }
}
