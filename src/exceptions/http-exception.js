'use strict';

const HttpStatus = {
  Forbidden: 403,
  HardReject: 411,
  NotFound: 404,
  Unknown: 666,
  BadRequest: 400,
  UnProcessableEntity: 422,
};

class HttpException extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

module.exports = { HttpStatus, HttpException };
