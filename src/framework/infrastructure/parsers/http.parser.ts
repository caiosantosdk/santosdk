import { toPairs, isPlainObject } from 'lodash';


export const toQueryString = (obj:any) => {
    if(!isPlainObject(obj)) throw new Error('toQueryString accepts only plain objects')
    return toPairs(obj).map(([key, val]) => `${key}=${val}`).join(`&`)
}