import { z } from 'zod'

export const userRecordSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    name: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    password: z.string(),
})

export type UserRecord = z.infer<typeof userRecordSchema>
