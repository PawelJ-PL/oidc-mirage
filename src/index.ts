import { createApp } from './app'
import { depsLive } from './app-deps/live'

const start = async () => {
    const deps = await depsLive()

    const app = createApp(deps)

    app.listen(deps.appConfig.SERVER_PORT)
        .on('listening', () => deps.logger.info(`Server listening on port ${deps.appConfig.SERVER_PORT}`))
        .on('close', () => deps.logger.info('Server closed'))
}

void start()
