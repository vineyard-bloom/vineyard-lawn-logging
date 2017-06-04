import {Collection, Modeler} from "vineyard-ground"
import {StandardErrorLogger, Error} from 'vineyard-error-logging'
import {Request, RequestListener, SimpleResponse} from 'vineyard-lawn'

export interface Request_Record {
  path: string
  method: string
  data: string
  session: string
  user: string
  response_code: number
  response_message: string
  response_body: string
  milliseconds: number
  version: string
}

export class CommonRequestLogger implements RequestListener {
  requestCollection: Collection<Request_Record>
  errorLogger: StandardErrorLogger

  constructor(requestCollection: Collection<Request_Record>, errorLogger: StandardErrorLogger) {
    this.requestCollection = requestCollection
    this.errorLogger = errorLogger
  }

  onRequest(request: Request, response: SimpleResponse, req): Promise<any> {
    const record: Request_Record = {
      path: req.path,
      method: req.method.toLowerCase(),
      data: JSON.stringify(request.data),
      session: request.session ? request.session.id : null,
      user: request.user ? request.user.id : null,
      response_code: response.code,
      response_message: response.message,
      response_body: response.body,
      milliseconds: new Date().getTime() - request.startTime,
      version: request.version.toString(),
    }
    return this.requestCollection.create(record)
  }

  onError(error, request?: Request): Promise<any> {
    return this.errorLogger.logError(error)
  }

}

export function initializeRequestLogSchema(modeler: Modeler) {
  modeler.addDefinitions(require('./schema/request.json'))
}