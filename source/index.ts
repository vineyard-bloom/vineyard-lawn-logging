import {Collection, Modeler} from "vineyard-ground"
import {StandardErrorLogger, ErrorRecord} from 'vineyard-error-logging'
import {Request, RequestListener, SimpleResponse} from 'vineyard-lawn'

export interface RequestRecord {
  path: string
  method: string
  parameters: string
  session: string
  user: string
  response_code: number
  response_message: string
  response_body: string
  milliseconds: number
  version: string
  ip: string
}

function sanitizeRequestBody(body) {
  if (body && (body.password || body.twoFactor)) {
    body = Object.assign({}, body)

    if (body.password)
      body.password = '****'

    if (body.twoFactor)
      body.twoFactor = '****'
  }

  return body
}

function sanitizeResponseBody(body) {
  if (body && (body.secret || body.secret_url)) {
    body = Object.assign({}, body)

    if (body.secret)
      body.secret = '****'

    if (body.secret_url)
      delete body.secret_url // secret_url is deprecated.
  }

  return body
}

function formatObject(item) {
  return !item || Object.keys(item).length == 0
    ? ''
    : JSON.stringify(item)
}

export class CommonRequestLogger implements RequestListener {
  requestCollection: Collection<RequestRecord>
  errorLogger: StandardErrorLogger

  constructor(requestCollection: Collection<RequestRecord>, errorLogger: StandardErrorLogger) {
    this.requestCollection = requestCollection
    this.errorLogger = errorLogger
  }

  onRequest(request: Request, response: SimpleResponse, req): Promise<any> {
    const path = req.path[0] == '/' ? req.path.substr(1) : req.path
    const record: RequestRecord = {
      path: path,
      method: req.method.toLowerCase(),
      parameters: formatObject(sanitizeRequestBody(request.data)),
      session: request.session ? request.session.id : null,
      user: request.user ? request.user.id : null,
      response_code: response.code,
      response_message: response.message,
      response_body: JSON.stringify(sanitizeResponseBody(response.body)),
      milliseconds: new Date().getTime() - request.startTime,
      version: request.version.toString(),
      ip: request.original.ip
    }
    return this.requestCollection.create(record)
  }

  onError(error, request?: Request): Promise<any> {
    const record: ErrorRecord = {
      code: error.status,
      key: '',
      message: error.message,
      stack: error.stack,
    }
    return this.errorLogger.logError(record)
  }

}

export function trackIPs(app) {
  app.enable('trust proxy')
}

export function initializeRequestLogSchema(modeler: Modeler) {
  modeler.addDefinitions(require('./schema/request.json'))
}