import { Router, Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';
import { Trade } from '../../models/trade.js';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const trades = await Trade.findAll();

    res.send(trades);
});

router.post('/', async (req: Request, res: Response) => {
    let body = req.body;

    const trade = await Trade.create({
        ticker: 'NVDA',
        shares: 13,
        price: 129.29,
        time: new Date(2024, 9, 3, 14, 22, 36),
        comments: 'long'
    });

    res.send({});
});

export const trades_rtr: Router = router;