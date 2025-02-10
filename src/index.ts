import { createApp } from './app'
import { depsLive } from './app-deps/live'

const start = async () => {
    const deps = await depsLive()

    const app = createApp(deps)

    const controller = new AbortController()

    app.listen({ port: deps.appConfig.SERVER_PORT, signal: controller.signal })
        .on('listening', () => deps.logger.info(`Server listening on port ${deps.appConfig.SERVER_PORT}`))
        .on('close', () => deps.logger.info('Server closed'))

    process.on('SIGINT', () => {
        deps.logger.info('Server shutting down (SIGINT)')
        controller.abort()
    })

    process.on('SIGTERM', () => {
        deps.logger.info('Server shutting down (SIGTERM)')
        controller.abort()
    })
}

void start()
