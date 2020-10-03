// import * as mongoose from "mongoose";
import mongoose = require("mongoose");
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_PATH,
    MONGO_DB_NAME,
} = process.env;
const connectMongoDb = async() => {
    try {
    // const url = "mongodb+srv://mongodb:mongodb123@cluster-mongo.4gdll.mongodb.net/test";
        const url = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}/${MONGO_DB_NAME}`;
        mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

        mongoose.connection.on('connected', () => {
            console.log("Mongo DB connected!")
        }).on('open', () => {
            // console.log("Mongo DB connection status - open")
        }).on('close', () => {
            console.log("Mongo DB connection closed!");
        }).on('close', () => {
            console.log("Mongo DB connection closed!");
        }).on('serverHeartbeatFailed', () => {
            console.log("Mongo DB server heartbeat failed!");
        }).on('topologyClosed', () => {
            console.log("Mongo DB topology closed!");
        });
    } catch (error) {
        console.log(error);
    }
}

export default connectMongoDb;