import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import * as CognitoExpress from 'cognito-express';

const cognitoExpress = new CognitoExpress.Strategy({
	region: "us-east-1",
	cognitoUserPoolId: "us-east-1_Hp5cw68QW",
	tokenUse: "access", //Possible Values: access | id
	tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
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
