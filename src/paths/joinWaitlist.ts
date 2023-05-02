import { Request, Response, Router, urlencoded } from 'express';
import {
    WaitingForName,
    addWaitlist,
    getExistingWailist as getExistingWaitlist,
    insertWaitlist
} from '../util/Waitlist';

const JoinWaitlistRouter = Router();

JoinWaitlistRouter.use(urlencoded({ extended: true }));

interface JoinWailistRouter extends Request {
    body: Partial<{
        email: string;
        waitingFor: string;
    }>;
}

const waitingForStrs = ['RADAR Discover', 'RADAR Launch', 'More play-full future'];

JoinWaitlistRouter.post('/', async (req: JoinWailistRouter, res: Response) => {
    if (!req.body.email) return res.status(400).end();
    if (!req.body.waitingFor) return res.status(400).end();
    if (!waitingForStrs.includes(req.body.waitingFor)) return res.status(400).end();

    const existing = await getExistingWaitlist(req.body.email);

    let newRecord;

    if (!existing) {
        newRecord = await insertWaitlist({
            email: req.body.email,
            waitingFor: req.body.waitingFor as WaitingForName
        });
    } else {
        newRecord = await addWaitlist(existing, req.body.waitingFor as WaitingForName);
    }

    res.json({ waitlisted: true, waitingFor: newRecord.fields['Waiting for:'] });
});

export default JoinWaitlistRouter;
