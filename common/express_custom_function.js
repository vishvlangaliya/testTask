const logger = require('../helper/logger');

module.exports = function (express) {

    global.HTTP_STATUS_CODES = {
        OK: 200, // For send data, message
        CREATED: 201, // Resource Created
        ACCEPTED: 202, // Update, edit, delete request accepted
        NO_BODY: 204, // No content
        PARTIAL_SUCCESS: 206, // Partial content, request success but some part might failed
        NO_MODIFIED: 304, // No Data change
        BAD_REQUEST: 400, // Validation failed
        UNAUTHORIZED: 401, // Access without login
        FORBIDDEN: 403, // Forbidden
        NOT_FOUND: 404, // URL, Route, Page not found
        METHOD_NOT_ALLOWED: 405, // HTTP method
        CONFLICT: 409, // Duplicate, Already identity available
        UNSUPPORTED_TYPE: 415, // Unsupported media type
        LOCKED: 423, // Resource Locked
        ILLEGAL_ACCESS: 451, // Resource restrict by admin/system
        SERVER_ERROR: 500,
        BAD_GATEWAY: 502, // Not able to connect third party service or other service.
        SERVICE_UNAVAILABLE: 503, // Current service not available
        NOT_ACCEPTABLE: 406, // Request is not acceptable as some thing is missing
    };

    express.response.sendSuccess = function (data = {}, customMessage) {
        logger.log({ level: 'info', data, message: customMessage });
        this.status(200).send({
            status: 200,
            data: data,
            message: customMessage || undefined,
        });
    };

    express.response.sendDuplicate = function (message) {
        this.status(409).send({
            status: 409,
            message: message,
        });
    };

    express.response.sendIsExists = function (response) {
        const code = response ? 200 : 404; // 200 = Resource exists, 404 = Resource does not exit
        this.status(code).send();
    };

    express.response.sendCreated = function (message, data = {}) {
        this.status(201).json({
            status: 201,
            data: data,
            message: message,
        });
    };

    express.response.sendUpdated = function (message, data = {}) {
        this.status(202).json({
            status: 202,
            data: data,
            message: message,
        });
    };

    express.response.sendDeleted = function (message) {
        this.status(202).json({
            status: 202,
            message: message,
        });
    };

    express.response.sendError = function (message) {
        logger.log({ level: 'error', message });
        this.status(500).json({
            status: 500,
            message: message,
        });
    };

    express.response.sendInvalidRequest = function (message) {
        this.status(400).json({
            status: 400,
            message: message,
        });
    };

    express.response.sendMessage = function (title, message) {
        // We've set code 200 to send response message in body
        this.status(200).json({
            status: 204,
            messageOnly: true,
            title: title,
            message: message,
        });
    };

    express.response.sendResourceNotFound = function (message) {
        this.status(404).json({
            status: 404,
            message: message,
        });
    };

    express.response.sendForbidden = function (message) {
        this.status(403).json({
            status: 403,
            message: message,
        });
    };

    express.response.sendUnAuthorized = function (message) {
        this.status(401).json({
            status: 401,
            message: message,
        });
    };

    express.response.sendPartialUpdate = function (message) {
        this.status(206).json({
            status: 206,
            message: message,
        });
    };
};
