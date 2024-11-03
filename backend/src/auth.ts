import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import * as CognitoExpress from 'cognito-express';
import { config } from './config/config.js';

const c = config.dev;

const cognitoExpress = new CognitoExpress.Strategy({
	region: c.aws_region,
	cognitoUserPoolId: c.cognito_user_pool_id,
	tokenUse: c.token_use, //Possible Values: access | id
	tokenExpiration: c.token_expiration
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {    
    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }
  
    let accessTokenFromClient = req.headers.authorization;

    if (!accessTokenFromClient) {
        return res.status(401).send("Access Token missing from header");
    }
    
	cognitoExpress.validate(accessTokenFromClient, function(err: any, response: any) {
		if (!err) {
            res.locals.user = response;
            console.log(res.locals.user);
            next();
        }
        else {
            return res.status(401).send({ auth: false, message: 'Failed to authenticate.'});
        }
	});
}
