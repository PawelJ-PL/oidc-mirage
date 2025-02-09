import { z } from 'zod'

export const idTokenPayloadSchema = z.object({
    iss: z.string(),
    sub: z.string(),
    aud: z.string(),
    exp: z.number(),
    iat: z.number(),
    nonce: z.string().optional(),
    email: z.string().email(),
    email_verified: z.boolean(),
    name: z.string(),
    given_name: z.string(),
    family_name: z.string(),
})

export type IdTokenPayload = z.infer<typeof idTokenPayloadSchema>
