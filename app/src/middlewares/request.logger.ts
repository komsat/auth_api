import { NextFunction, Request, Response } from 'express';
// import { NextFunction } from "express";

const requestLogger = (req: Request, resp: Response, next: NextFunction) => {
    console.info(`${req.method} ${req.originalUrl}`);
    const start = new Date().getTime();
    resp.on('finish', () => {
        const elapsed = new Date().getTime() - start;
        console.info(`${req.method} ${req.path} ${resp.statusCode} ${elapsed}ms`)
    })
    next();
};

export default requestLogger;