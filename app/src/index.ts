import 'dotenv/config';
import App from '../app';
import AuthController from './controllers/auth.controller';
// import UserController from '../src/controllers/user.controller';
import validateEnv from './utils/validateEnv.utils';

validateEnv();

const app = new App(
  [
    new AuthController(),
    // new UserController(),
  ],
);

app.listen();