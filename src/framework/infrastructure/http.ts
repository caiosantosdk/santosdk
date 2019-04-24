import "reflect-metadata";
import * as jwt from 'jsonwebtoken';
import * as restify from 'restify';
import { getHttpPort, getCorsConfig, getJWTConfig } from './config';
import { getLoggerFor } from './logger';
import { HttpStatusCode } from '../datastructures/enumerators/http-status-code.enum';
import { flatten } from 'lodash';
import { Action } from "../datastructures/interfaces/http-controller-action.interface";
import * as corsMiddleware from 'restify-cors-middleware';
import { HttpMetadata } from "../datastructures/enumerators/http-metadata.enum";
import HelloWorldHttpController from "../../examples/HelloWorldHttpController";
const Ajv = require('ajv');
const localize = { br: require('ajv-i18n/localize/pt-BR') };




const getActions = async (): Promise<Action[]> => {

  const controllers = [
    HelloWorldHttpController
  ];

  return flatten(controllers.map(controller => {

    const prefix: string = Reflect.getMetadata(HttpMetadata.URL_PREFIX, controller);

    return Reflect
      .ownKeys(controller.prototype)
      .map(key => ({ key, fn: controller.prototype[key] }))
      .filter(({ fn }) => Reflect.hasMetadata(HttpMetadata.URL, fn))
      .map(({ key, fn }) => ({
        method: Reflect.getMetadata(HttpMetadata.URL_METHOD, fn),
        url: Reflect.getMetadata(HttpMetadata.URL, fn),
        parameters: Reflect.getOwnMetadata(HttpMetadata.PARAMETERS, controller.prototype, String(key)),
        userInjectionIdx: Reflect.getOwnMetadata(HttpMetadata.USER, controller.prototype, String(key)),
        bodyInjectionIdx: Reflect.getOwnMetadata(HttpMetadata.BODY, controller.prototype, String(key)),
        bodyKeys: Reflect.getOwnMetadata(HttpMetadata.BODY_KEYS, controller.prototype, String(key)),
        bodySchema: Reflect.getMetadata(HttpMetadata.BODY_SCHEMA, fn),
        isOnlyForUsers: !!Reflect.getMetadata(HttpMetadata.IS_ONLY_FOR_USERS, fn),
        fn
      }))
      .map(({
        method,
        url,
        parameters,
        userInjectionIdx,
        bodyInjectionIdx,
        bodyKeys,
        bodySchema,
        isOnlyForUsers,
        fn,
      }): Action => {

        const endpoint = `${prefix}${url}`;
        const handler = `${controller.name}.${fn.name}`;

        return {
          method,
          endpoint,
          parameters: parameters || [],
          bodyKeys: bodyKeys || [],
          isOnlyForUsers,
          userInjectionIdx,
          bodyInjectionIdx,
          bodySchema,
          handler,
          fn
        }

      });
  }));
}




/**
 * sign
 * 
 * Docs
 * https://github.com/auth0/node-jsonwebtoken#readme
 * @author newcaiosantos
 * @since 2019-04-11 21:22
 */
export const createJWT = (user: any, payload: any): Promise<string> => new Promise(async (resolve, reject) => {

  const { secret, expiresIn } = await getJWTConfig();

  jwt.sign({ ...payload, user }, secret, { expiresIn }, (err, token) => {
    if (err) return reject(err);
    return resolve(token);
  });
})




const verifyJWT = (token: string): Promise<any> => new Promise(async (resolve, reject) => {

  const logger = await getLoggerFor(`infra`, `http`, `verifyJWT`);
  const { secret } = await getJWTConfig();

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      logger.debug('Problemas ao verificar JWT:' + err.message);
      const httpErr: any = new Error('Acesso não autorizado');
      httpErr.statusCode = HttpStatusCode.UNAUTHORIZED;
      return reject(httpErr);
    }
    return resolve(decoded);
  });
})




export const httpBoot = async () => {

  const logger = await getLoggerFor(`infra`, `http`, `httpBoot`);
  logger.info(`Booting HTTP`);

  const httpPort = await getHttpPort();
  const server = restify.createServer();

  const cors = corsMiddleware(await getCorsConfig()) // TODO FIX apos types deu erro. Corrija.

  server.pre(cors.preflight)
  server.use(cors.actual)
  server.use(restify.plugins.bodyParser());

  const actions: Action[] = await getActions();
  actions.forEach((action: Action) => {

    logger.info(`${action.method} ${action.endpoint} handled by ${action.handler}`);
    server[action.method](action.endpoint, async (req: any, res: any, next: Function) => {

      const logger = await getLoggerFor(`infra`, `http`, `request`);
      logger.debug(`${action.method} ${action.endpoint}`);

      const params = req.params || {};

      const applyArgs = new Array();
      action.parameters.map(({ idx, id }) => applyArgs[idx] = params[id]);
      action.bodyKeys.map(({ idx, key }) => applyArgs[idx] = req.body ? req.body[key] : undefined);

      if (action.bodyInjectionIdx !== undefined) applyArgs[action.bodyInjectionIdx] = req.body

      try {

        if (action.isOnlyForUsers) {
          const token = req.header('auth')
          const { user } = await verifyJWT(token)
          if (action.userInjectionIdx !== undefined) applyArgs[action.userInjectionIdx] = user
        }
        
        if (!!action.bodySchema){
          const ajv = new Ajv({ allErrors: true });
          const isBodyValid = ajv.validate(action.bodySchema, req.body)
          if (!isBodyValid) {
            localize.br(ajv.errors);            
            const errMsg = ajv.errors.map(({message}) => message).join(', ')
            throw new Error(errMsg)
          }
        }
        
        const actionResponse = await action.fn.apply(action.fn, applyArgs);
        res.send(actionResponse);
        return next();
      } catch (err) {
        logger.error(`${action.method} ${action.endpoint} err response:`,err);
        res.send(err.statusCode || HttpStatusCode.BAD_REQUEST, {msg : err.message})
        return next()
      }
    })
  })

  server.listen(httpPort, () => logger.info(`HTTP server ${server.name} listening at ${httpPort}`));
}