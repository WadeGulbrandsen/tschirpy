export abstract class HTTPError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class BadRequestError extends HTTPError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UserNotAuthorizedError extends HTTPError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class UserForbiddenError extends HTTPError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends HTTPError {
  constructor(message: string) {
    super(message, 404);
  }
}
