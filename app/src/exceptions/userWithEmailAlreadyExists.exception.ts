import HttpException from './http.exception';

class UserWithThatEmailAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(400, `User with email ${email} already exists`);
  }
}

export default UserWithThatEmailAlreadyExistsException;