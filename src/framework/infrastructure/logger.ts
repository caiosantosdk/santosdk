import { values, isObject } from 'lodash';
import { Env, getEnv } from './config';
import * as moment from 'moment';




const createLogMsg = (prefix: string, ...args: any[]) => {
    const [logArgs] = args;
    let logMsg = logArgs.map((arg: any) => isObject(arg) ? (arg instanceof Error ? arg.toString() : JSON.stringify(arg, null, 2)) : arg).join(`\n`);
    return logArgs.length > 1 ? `${prefix}>>\n${logMsg}\n${prefix}<<` : `${prefix}${logMsg}`;
}




const log = (...args:any[]) => {
    console.log.apply(null, [moment().format('YYYY-MM-DD HH:mm:ss SSS'),...args])
}




const getLogger = async (prefix: string) => {
    const env: Env = await getEnv();
    return {
        debug: async (...args: any[]) => {
            const mode:string = `[D]`;
            if (env === Env.PROD) return;
            try {
                log(createLogMsg(`${mode}${prefix}`, args))
            } catch (err) {
                log(`${mode} >>`)
                log.apply(this,args);
                log(`${mode} <<`)
            }
        },

        info: async (...args: any[]) => {
            const mode:string = `[I]`;
            try {
                log(createLogMsg(`${mode}${prefix}`, args))
            } catch (err) {
                log(`${mode} >>`)
                log.apply(this,args);
                log(`${mode} <<`)
            }
        },

        error: async(...args: any[]) => {
            const mode:string = `[E]`;
            try {
                log(createLogMsg(`${mode}${prefix}`, args))
            } catch (err) {
                log(`${mode} >>`)
                log.apply(this,args);
                log(`${mode} <<`)
            }
        }
    }
}




export const getLoggerFor = (...args: any[]) => {
    const prefix = values(args).map(value => `[${value}]`).join(``);
    return getLogger(prefix);
}