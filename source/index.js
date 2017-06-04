"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonRequestLogger = (function () {
    function CommonRequestLogger(requestCollection, errorLogger) {
        this.requestCollection = requestCollection;
        this.errorLogger = errorLogger;
    }
    CommonRequestLogger.prototype.onRequest = function (request, response, req) {
        var record = {
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
        };
        return this.requestCollection.create(record);
    };
    CommonRequestLogger.prototype.onError = function (error, request) {
        return this.errorLogger.logError(error);
    };
    return CommonRequestLogger;
}());
exports.CommonRequestLogger = CommonRequestLogger;
function initializeRequestLogSchema(modeler) {
    modeler.addDefinitions(require('./schema/request.json'));
}
exports.initializeRequestLogSchema = initializeRequestLogSchema;
//# sourceMappingURL=index.js.map