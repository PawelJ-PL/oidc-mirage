import { z } from 'zod'
import dotenv from 'dotenv'
import { createPrivateKey } from 'crypto'
import { encodedPrivateKey, encodedPublicKeyJwk } from './signingKeys'

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.local' })
    dotenv.config({ path: '.env' })
}

const appConfigSchema = z.object({
    SERVER_PORT: z.coerce.number().default(8090),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_FORMAT: z.enum(['pretty', 'json']).default('json'),
    BASE_URL: z.string().optional(),
    USERS_DB_PATH: z.string().optional(),
    TOKEN_TTL_SECONDS: z.coerce.number().default(300),
    TOKEN_SIGNING_KEY: z
        .string()
        .default(encodedPrivateKey)
        .transform((value) => Buffer.from(value, 'base64'))
        .transform((value) => createPrivateKey(value)),
    TOKEN_SIGNING_KEY_ID: z.string().default('default'),
    TOKEN_SIGNING_PUBLIC_KEY_JWK: z
        .string()
        .default(encodedPublicKeyJwk)
        .transform((value) => JSON.parse(Buffer.from(value, 'base64').toString())),
})

export type AppConfig = z.infer<typeof appConfigSchema>

let appConfig: AppConfig | undefined

export const getAppConfig = (): AppConfig => {
    if (!appConfig) {
        appConfig = appConfigSchema.parse(process.env)
    }

    return appConfig
}
