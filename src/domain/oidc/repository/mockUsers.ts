import type { UserRecord } from '../types/userRecord'

export const mockUsers: Record<string, UserRecord> = {
    'a62a6290-0dec-41cc-afc9-397d71bc8412': {
        id: 'a62a6290-0dec-41cc-afc9-397d71bc8412',
        email: 'alice@example.com',
        emailVerified: true,
        name: 'alice',
        givenName: 'Alice',
        familyName: 'Doe',
        password: 'secret',
    },
    'e167c6c7-6362-4070-9f5d-1fe8dc4d9641': {
        id: 'e167c6c7-6362-4070-9f5d-1fe8dc4d9641',
        email: 'bob@example.com',
        emailVerified: false,
        name: 'bob',
        givenName: 'Bob',
        familyName: 'Doe',
        password: 'secret',
    },
}
