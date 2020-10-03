import HttpException from './http.exception';

class PostNotFoundException extends HttpException {
  constructor() {
    super(404, `Not found`);
  }
}

export default PostNotFoundException;