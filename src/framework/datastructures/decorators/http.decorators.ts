import "reflect-metadata";
import { HttpMetadata } from "../enumerators/http-metadata.enum";
import { HttpMethod } from "../enumerators/http-method.enum";




export function Controller(prefix: string) {
    return (target: any) => {
        Reflect.defineMetadata(HttpMetadata.URL_PREFIX, prefix, target);
    };
}




export function Get(url: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(HttpMetadata.URL_METHOD, HttpMethod.GET, descriptor.value);
        Reflect.defineMetadata(HttpMetadata.URL, url, descriptor.value);
    }
}





export function Post(url: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(HttpMetadata.URL_METHOD, HttpMethod.POST, descriptor.value);
        Reflect.defineMetadata(HttpMetadata.URL, url, descriptor.value);
    }
}




export function Put(url: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(HttpMetadata.URL_METHOD, HttpMethod.PUT, descriptor.value);
        Reflect.defineMetadata(HttpMetadata.URL, url, descriptor.value);
    }
}




export function BodySchema(schema: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(HttpMetadata.BODY_SCHEMA, schema, descriptor.value);
    }
}




export function Param(parameterId: string) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const parameters: { idx: number, id: string }[] = Reflect.getOwnMetadata(HttpMetadata.PARAMETERS, target) || [];
        parameters.push({ idx: parameterIndex, id: parameterId });
        Reflect.defineMetadata(HttpMetadata.PARAMETERS, parameters, target, propertyKey);
    }
}




export function FromBody(bodyKey: string) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const bodyKeys: { idx: number, key: string }[] = Reflect.getOwnMetadata(HttpMetadata.BODY_KEYS, target) || [];
        bodyKeys.push({ idx: parameterIndex, key: bodyKey });
        Reflect.defineMetadata(HttpMetadata.BODY_KEYS, bodyKeys, target, propertyKey);
    }
}




export function OnlyForUsers(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(HttpMetadata.IS_ONLY_FOR_USERS, true, descriptor.value);
}




export function User(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(HttpMetadata.USER, parameterIndex, target, propertyKey);
}




export function Body(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(HttpMetadata.BODY, parameterIndex, target, propertyKey);
}