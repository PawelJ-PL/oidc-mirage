import type { ApplicationDeps } from '../app'
import { getAppConfig } from '../common/config/appConfig'
import { createLogger } from '../common/logger/logger'
import { createOidcRouter } from '../domain/oidc/http/router'
import { createUsersRepository } from '../domain/oidc/repository/usersRepository'
import { createOidcService } from '../domain/oidc/service/oidcService'

export const depsLive = async (): Promise<ApplicationDeps> => {
    const appConfig = getAppConfig()
    const logger = createLogger(appConfig)
    const usersRepository = await createUsersRepository({ appConfig })
    const oidcService = createOidcService({ logger, usersRepository, appConfig })
    const oidcRoutes = createOidcRouter({ oidcService, appConfig, logger })

    return {
        appConfig,
        logger,
        oidcRoutes,
    }
}
