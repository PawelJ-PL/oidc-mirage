import type { AppConfig } from '../../../common/config/appConfig'
import { readFile } from 'fs/promises'
import { type UserRecord, userRecordSchema } from '../types/userRecord'
import { z } from 'zod'
import { mockUsers } from './mockUsers'

export type OidcUsersRepositoryDeps = {
    appConfig: AppConfig
}

const loadUsersFromFile = async (path: string): Promise<Record<string, UserRecord>> => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await readFile(path)
    const json = JSON.parse(content.toString())

    return z.record(userRecordSchema).parse(json)
}

export const createUsersRepository = async (deps: OidcUsersRepositoryDeps) => {
    const { appConfig } = deps

    const users = appConfig.USERS_DB_PATH ? await loadUsersFromFile(appConfig.USERS_DB_PATH) : mockUsers

    return {
        getByName: (name: string): Promise<UserRecord | undefined> => {
            return Promise.resolve(Object.values(users).find((user) => user.name === name))
        },
    }
}

export type UsersRepository = Awaited<ReturnType<typeof createUsersRepository>>
