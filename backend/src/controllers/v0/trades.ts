import { Router, Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';
import { Trade } from '../../models/trade.js';
import { idText } from 'typescript';
import { json } from 'sequelize';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    try {
        const trades = await Trade.findAll({
            attributes: [ 'id', 'ticker', 'shares', 'price', 'time', 'comments' ],
            where: {
                user_id: user_id
            }
        })

        res.send(trades);
    }
    catch(e: unknown) {
        res.status(400);
        res.send({ error: 'An error has occured' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    let body = req.body;

    try {
        const trade = await Trade.create({
            user_id: user_id,
            ticker: body.ticker,
            shares: body.shares,
            price: body.price,
            //time: new Date(2024, 9, 3, 14, 22, 36),
            time: body.time,
            comments: body.comments
        });

        let resp = { inserted_id: trade.id };

        res.send(resp);
    }
    catch(e: unknown) {
        res.status(400);
        res.send({ error: 'An error has occured' });
    }
});

router.put('/', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    let body = req.body;

    try {
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

        res.send({});
    }
    catch(e: unknown) {
        res.status(400);
        res.send({ error: 'An error has occured' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    let user_id = res.locals.user.sub;

    let id = req.params.id;

    try {
        let result = await Trade.destroy({
            where: {
                id: id,
                user_id: user_id
            }
        });

        res.send({});
    }
    catch(e: unknown) {
        res.status(400);
        res.send({ error: 'An error has occured' });
    }
});

export const trades_rtr: Router = router;