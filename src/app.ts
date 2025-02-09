import Koa from 'koa'
import type { OidcRouter } from './domain/oidc/http/router'
import type { Logger } from 'pino'
import type { AppConfig } from './common/config/appConfig'

export type ApplicationDeps = {
    logger: Logger
    appConfig: AppConfig
    oidcRoutes: OidcRouter
}

export const createApp = (deps: ApplicationDeps) => {
    const app = new Koa()
    app.use(deps.oidcRoutes.routes())

    return app
}
