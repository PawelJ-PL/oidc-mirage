import { z } from 'zod'
import { idTokenPayloadSchema } from './idTokenPayload'

export const authCodePayloadSchema = z.object({
    tokenPayload: idTokenPayloadSchema,
    redirectUrl: z.string(),
    state: z.string().optional(),
})

export type AuthCodePayload = z.infer<typeof authCodePayloadSchema>
