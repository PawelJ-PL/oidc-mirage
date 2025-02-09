import { z } from 'zod'

export const oidcAuthenticationRequestParamsSchema = z.object({
    client_id: z.string(),
    redirect_uri: z.string().url(),
    response_type: z.string(),
    scope: z.string(),
    state: z.string().optional(),
    nonce: z.string().optional(),
})

export type OidcAuthenticationRequestParams = z.infer<typeof oidcAuthenticationRequestParamsSchema>
