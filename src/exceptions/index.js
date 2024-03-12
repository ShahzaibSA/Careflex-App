const { HttpException, HttpStatus } = require('./http-exception');

class BadRequestException extends HttpException {
  constructor(message) {
    super(HttpStatus.BadRequest, message);
  }
}

class NotFoundException extends HttpException {
  constructor(message) {
    super(HttpStatus.NotFound, message);
  }
}

module.exports = {
  BadRequestException,
  NotFoundException,
};
