export interface Action {
    isOnlyForUsers:boolean,
    userInjectionIdx:number|undefined,
    bodyInjectionIdx:number|undefined,
    bodySchema:any|undefined,
    method: string,
    endpoint: string,
    parameters : {idx:number, id:string}[],
    bodyKeys : {idx:number, key:string}[],
    handler : string,
    fn: Function
}