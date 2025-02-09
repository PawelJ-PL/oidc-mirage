import Router from '@koa/router'
import {
    createOidcAuthHandler,
    createOidcDiscoveryHandler,
    createOidcJwksHandler,
    createOidcTokenHandler,
    type OidcHandlerDeps,
} from './handlers/oidcHandler'
import koaBody from 'koa-body'

export const createOidcRouter = (deps: OidcHandlerDeps) => {
    const oidcRouter = new Router()

    oidcRouter.get('/.well-known/openid-configuration', (ctx) => createOidcDiscoveryHandler(deps)(ctx))
    oidcRouter.get('/authorize', (ctx) => createOidcAuthHandler(deps)(ctx))
    oidcRouter.post('/token', koaBody({ urlencoded: true }), (ctx) => createOidcTokenHandler(deps)(ctx))
    oidcRouter.get('/jwks', (ctx) => createOidcJwksHandler(deps)(ctx))

    return oidcRouter
}

export type OidcRouter = ReturnType<typeof createOidcRouter>
