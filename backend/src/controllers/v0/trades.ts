import { Router, Request, Response } from 'express';
import { ErrorRequestHandler } from 'express-serve-static-core';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    let record = [
        { id: 1, name: "Marc" },
        { id: 2, name: "Mike" }
    ];

    res.send(record);
});

router.post('/', async (req: Request, res: Response) => {
    let body = req.body;
    let record = [
        { id: 1, name: "Marc" },
        { id: 2, name: "Mike" },
        { body: body }
    ];

    res.send(record);
});

export const trades_rtr: Router = router;