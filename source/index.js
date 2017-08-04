"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sanitizeRequestBody(body) {
    if (body && (body.password || body.twoFactor)) {
        body = Object.assign({}, body);
        if (body.password)
            body.password = '****';
        if (body.twoFactor)
            body.twoFactor = '****';
    }
    return body;
}
function sanitizeResponseBody(body) {
    if (body && (body.secret || body.secret_url)) {
        body = Object.assign({}, body);
        if (body.secret)
            body.secret = '****';
        if (body.secret_url)
            delete body.secret_url; // secret_url is deprecated.
    }
    return body;
}
function formatObject(item) {
    return !item || Object.keys(item).length == 0
        ? ''
        : JSON.stringify(item);
}
var CommonRequestLogger = (function () {
    function CommonRequestLogger(requestCollection, errorLogger) {
        this.requestCollection = requestCollection;
        this.errorLogger = errorLogger;
    }
    CommonRequestLogger.prototype.onRequest = function (request, response, req) {
        var path = req.path[0] == '/' ? req.path.substr(1) : req.path;
        var record = {
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
        };
        return this.requestCollection.create(record);
    };
    CommonRequestLogger.prototype.onError = function (error, request) {
        var record = {
            code: error.status,
            key: '',
            message: error.message,
            stack: error.stack,
        };
        return this.errorLogger.logError(record);
    };
    return CommonRequestLogger;
}());
exports.CommonRequestLogger = CommonRequestLogger;
function trackIPs(app) {
    app.enable('trust proxy');
}
exports.trackIPs = trackIPs;
function initializeRequestLogSchema(modeler) {
    modeler.addDefinitions(require('./schema/request.json'));
}
exports.initializeRequestLogSchema = initializeRequestLogSchema;
//# sourceMappingURL=index.js.map