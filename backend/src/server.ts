import 'dotenv/config'
import express, {ErrorRequestHandler, NextFunction, Express, Request, Response} from 'express';
import { sequelize, syncModels } from './sequelize.js';
import { requireAuth } from './auth.js';
import cors from 'cors';
import { v0_rtr } from './controllers/v0/index.js'
import { config } from './config/config.js';

const c = config.dev;

const app: Express = express();
const port = 3000;

(async () => {

    try {
        await sequelize.authenticate();
        await syncModels();
        console.log('Connection has been established successfully.');
    } 
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    var whitelist = [c.url]
    var corsOptions = {
    origin: function (origin: any, callback: any) {
            if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
            } else {
            callback(new Error('Not allowed by CORS'))
            }
        }
    }

    app.use(cors(corsOptions));
    app.use(requireAuth);
    app.use(express.json());
    app.use('/api/v0', v0_rtr);

    app.get('/', (req: Request, res: Response)=>{
        res.send('Hello, this is Expresss + TypeScript');
    });

    app.listen(port, ()=> {
        console.log(`[Server]: I am running at https://localhost:${port}`);
    });

    // import { Trade } from './models/trade.js'
    // let t: Trade = new Trade({ ticker: 'NV', shares: 97, price: 12345678987.5505123, time: '2024-05-26 19:42:07.022+06' });
    // try {
    //     let v: any = await t.validate();
    //     //console.log(v);
    //     // await t.save();
    // }
    // catch (ex: any) {
    //     console.log(`doesn't validate, ${ex.message}`);
    // }
    // await sequelize.close();
})();


