// import * as express from 'express';
import * as bcrypt from 'bcrypt';
// import * as jwt from 'jsonwebtoken';
// import UserWithThatEmailAlreadyExistsException from '../exceptions/userWithEmailAlreadyExists.exception';
import WrongCredentialsException from '../exceptions/wrongCreds.exception';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import CreateUserDto from '../DTOs/user.dto';
import userModel from '../models/user.model';
import LogInDto from '../DTOs/login.dto';
import { Request, Response, Router, NextFunction } from 'express';
import AuthenticationService from '../services/auth.service';
// import TokenData from '../interfaces/tokendata.interface';
// import User from '../interfaces/user.interface';
// import DataStoredInToken from '../interfaces/datastoredintoken.interface';
import path from 'path';
import appRoot from 'app-root-path';
import { v4 as uuidv4 } from 'uuid';

class AuthController implements Controller{
  public path = '/auth';
  public router = Router();
  public authenticationService = new AuthenticationService();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/register`, this.register);
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.get(`${this.path}/login`, this.login);
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
    this.router.get(`/`, this.home);
  }

  private register = (request: Request, response: Response) => {
    // response.send(`${__dirname}`);
    response.sendFile(path.join(`${appRoot}/app/src/public/auth/registration.html`));
  }

  private registration = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const {
        cookie,
        // user,
        refreshTokenData,
        sessionCookie
      } = await this.authenticationService.register(userData);
      response.setHeader('Set-Cookie', [cookie, sessionCookie]);
      // response.setHeader('Set-Cookie', [sessionCookie]);
      response.send({
        code: 200,
        status: 'success',
        message: 'successfully registered',
        refresh_token: refreshTokenData,
      });
    } catch (error) {
      next(error);
    }
  }

  private login = (request: Request, response: Response) => {
    // response.send(`${__dirname}`);
    response.sendFile(path.join(`${appRoot}/app/src/public/auth/login.html`));
  }

  private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
    // response.send(request.body);
    const logInData: LogInDto = request.body;
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.get('password', null, { getters: false }),
      );
      if (isPasswordMatching) {
        const sessionId = uuidv4();
        const userData = await this.user.findOneAndUpdate({ email: user.email }, { sessionInfo: {id: sessionId, created: new Date().toLocaleString(), user_agent: "Chrome Browser"}}, {
          new: true,
          useFindAndModify: false
        });
        if(sessionId === userData.sessionInfo.id){
          user.sessionInfo.id = sessionId;
          const tokenData = this.authenticationService.createToken(user);
          const refreshTokenData = this.authenticationService.createRefreshToken(user);
          response.setHeader('Set-Cookie', [this.authenticationService.createCookie(tokenData), this.authenticationService.createSessionCookie(sessionId)]);
          // response.setHeader('Set-Cookie', [this.authenticationService.createSessionCookie(sessionId)]);
        // response.redirect("http://localhost:3000/");
          response.send({
            code: 200,
            status: 'success',
            message: 'successfully logged in',
            refresh_token: refreshTokenData,
          });
        }
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  }

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0','coderamp_sid=;Max-age=0']);
    response.send({
      code: 200,
      status: 'success',
      message: 'successfully logged out'
    });
    // remove entry for sessionInfo.id in users schema
  }

  // private createCookie(tokenData: TokenData) {
  //   return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  // }

  // private createToken(user: User): TokenData {
  //   const expiresIn = 60 * 60; // an hour
  //   const secret = process.env.JWT_SECRET;
  //   const dataStoredInToken: DataStoredInToken = {
  //     _id: user._id,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email
  //   };
  //   return {
  //     expiresIn,
  //     token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
  //   };
  // }

  private home(request: Request, response: Response) {
    response.sendFile(path.join(`${appRoot}/app/src/public/auth/home.html`));
  }

}

export default AuthController;


export { AuthController };