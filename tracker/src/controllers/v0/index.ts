import { Router, Request, Response } from 'express';
import { trades_rtr } from './trades.js'

const router: Router = Router();

router.use('/trades', trades_rtr);

router.get('/', async (req: Request, res: Response) => {
    res.send("nothing to see here");
});

export const v0_rtr: Router = router;