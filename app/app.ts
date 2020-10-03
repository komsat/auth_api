import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import Controller from './src/interfaces/controller.interface';
import errorMiddleware from './src/middlewares/error.middleware';
import requestLogger from './src/middlewares/request.logger';
import connectMongoDb from './config/database/mongo.db';
import logger from './src/utils/logger.utils';

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(requestLogger);
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(express.static("/home/satyamkumar/personalProject/microservices/auth_api/app/src/img"));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  private connectToTheDatabase() {
    connectMongoDb();
    // logger.info("Logger works");
  }
}

export default App;