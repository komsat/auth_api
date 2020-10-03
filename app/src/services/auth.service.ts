import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/userWithEmailAlreadyExists.exception';
import DataStoredInToken from '../interfaces/datastoredintoken.interface';
import TokenData from '../interfaces/tokendata.interface';
import CreateUserDto from '../DTOs/user.dto';
import User from '../interfaces/user.interface';
import userModel from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

class AuthenticationService {
  public user = userModel;

  public async register(userData: CreateUserDto) {
    if (
      await this.user.findOne({ email: userData.email })
    ) {
      throw new UserWithThatEmailAlreadyExistsException(userData.email);
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const sessionId = uuidv4();
    const user = await this.user.create<User | Document>({ // giving error
      ...userData,
      password: hashedPassword,
      access_token: await bcrypt.hash(userData.email, 10),
      sessionInfo: {
        id: sessionId,
        created: new Date().toLocaleString(),
        user_agent: "Chrome Browser"
      }
    });
    const tokenData = this.createToken(user);
    const cookie = this.createCookie(tokenData);
    const sessionCookie = this.createSessionCookie(sessionId);
    const refreshTokenData = this.createRefreshToken(user);
    return {
      cookie,
      // user,
      refreshTokenData,
      sessionCookie
    };
  }

  public createToken(user: User): TokenData {
    const expiresIn = 5 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  public createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public createSessionCookie(sessionId : string) {
    return `coderamp_sid=${sessionId}; HttpOnly; Max-Age=${3600*24*7}`;
  }

  public createRefreshToken(user: User): string{
    const expiresIn = 7 * 24 * 60 * 60; // an hour
    const secret = process.env.JWT_REFRESH_TOKEN_SECRET + user.access_token + user.sessionInfo.id;
    const dataStoredInRefreshToken: DataStoredInToken = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };
    return jwt.sign(dataStoredInRefreshToken, secret, { expiresIn });
  }
}

export default AuthenticationService;