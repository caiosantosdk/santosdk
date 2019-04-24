export enum Env {
    LOCAL = 'local',
    DEV = 'dev',
    PROD = 'prod'
}




export const getHttpPort = async () => process.env.HTTP_PORT




/**
 * getCorsConfig
 * Docs: https://github.com/Tabcorp/restify-cors-middleware
 */
export const getCorsConfig = async () => ({
    origins: ['*'], // TODO FIX adequar para restricoes quando em producao
    allowHeaders: ['auth'],
    exposeHeaders: []
})




export const getEnv = async (): Promise<Env> => {
    switch (process.env.NODE_ENV) {
        case 'local': return Env.LOCAL;
        case 'dev': return Env.DEV;
        case 'prod': return Env.PROD;
        default: throw new Error(`NODE_ENV not defined or now known (${process.env.NODE_ENV})`)
    }
}




export const getMongoDbConfig = async () => ({
    database: process.env.MONGODB_DATABASE,
    connectionUrl: process.env.MONGODB_CONNECTION as string
})



export const getAppConfig = async () => ({
    name: process.env.APP_NAME as string
})




// TODO @deprecated migrar para seu modulo especifico, usando getConfigValue
export const getFacebookConfig = async () => ({
    baseUrl: process.env.FACEBOOK_BASE_URL,
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET
})




// TODO @deprecated migrar para seu modulo especifico, usando getConfigValue
export const getJWTConfig = async () => ({
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN
})




export const getConfigValue = async (configKey:string) : Promise<string> => {
    const value = process.env[configKey]
    if(value === undefined) throw new Error(`Value of config key ${configKey} not found`)
    return value;
}