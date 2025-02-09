import { z } from 'zod'

export const tokenRequestSchema = z.object({
    grant_type: z.literal('authorization_code'),
    code: z.string(),
    redirect_uri: z.string().url(),
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
})

export type TokenRequest = z.infer<typeof tokenRequestSchema>
