import { Collection, Modeler } from "vineyard-ground";
import { StandardErrorLogger } from 'vineyard-error-logging';
import { Request, RequestListener, SimpleResponse } from 'vineyard-lawn';
export interface Request_Record {
    path: string;
    method: string;
    data: string;
    session: string;
    user: string;
    response_code: number;
    response_message: string;
    response_body: string;
    milliseconds: number;
    version: string;
}
export declare class CommonRequestLogger implements RequestListener {
    requestCollection: Collection<Request_Record>;
    errorLogger: StandardErrorLogger;
    constructor(requestCollection: Collection<Request_Record>, errorLogger: StandardErrorLogger);
    onRequest(request: Request, response: SimpleResponse, req: any): Promise<any>;
    onError(error: any, request?: Request): Promise<any>;
}
export declare function initializeRequestLogSchema(modeler: Modeler): void;