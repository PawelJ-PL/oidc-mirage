import pino, { type DestinationStream, stdTimeFunctions } from 'pino'
import pinoPretty from 'pino-pretty'
import type { AppConfig } from '../config/appConfig'

const prettyOptions: pinoPretty.PrettyOptions = {
    colorize: true,
    colorizeObjects: true,
    singleLine: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss',
}

const getLoggerBase = (appConfig: AppConfig, attributes: Record<string, unknown>) => {
    const stream: DestinationStream | undefined =
        appConfig.LOG_FORMAT === 'pretty' ? pinoPretty(prettyOptions) : undefined

    const logger = pino(
        {
            base: attributes,
            level: appConfig.LOG_LEVEL,
            timestamp: stdTimeFunctions.isoTime,
            formatters: {
                level: (label) => {
                    return { level: label }
                },
            },
        },
        stream,
    )

    return logger
}

export const createLogger = (appConfig: AppConfig) => {
    return getLoggerBase(appConfig, {})
}
