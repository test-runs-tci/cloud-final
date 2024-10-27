import { Router, Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';
import { Trade } from '../../models/trade.js';
import { idText } from 'typescript';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    const trades = await Trade.findAll({
        attributes: [ 'id', 'ticker', 'shares', 'price', 'time', 'comments' ],
        where: {
            user_id: user_id
        }
    })

    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(trades);
});

router.post('/', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    let body = req.body;
    console.log('req', req);

    const trade = await Trade.create({
        user_id: user_id,
        ticker: body.ticker,
        shares: body.shares,
        price: body.price,
        //time: new Date(2024, 9, 3, 14, 22, 36),
        time: body.time,
        comments: body.comments
    });

    res.send(body);
});

router.put('/', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    let body = req.body;
    console.log('req', req);

    console.log('start');

    const trade = await Trade.update({
        ticker: body.ticker,
        shares: body.shares,
        price: body.price,
        //time: new Date(2024, 9, 3, 14, 22, 36),
        time: body.time,
        comments: body.comments
    },
    { 
        where: {
            id: body.id,
            user_id: user_id
        }

    });

    console.log('end');

    res.send(body);
});

router.delete('/:id', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    let id = req.params.id;

    let result = await Trade.destroy({
        where: {
            id: id,
            user_id: user_id
        }
    });

    res.send(id);
});

export const trades_rtr: Router = router;