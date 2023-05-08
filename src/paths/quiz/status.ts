import { Request, Router, json } from 'express';
import { getQuizStatus, upsertQuizStatus } from '../../util/QuizStorage';

const StatusRouter = Router();

interface StatusPostRequest extends Request {
    body: Partial<{
        email: string;
        quizStatus: boolean;
    }>;
}

StatusRouter.use(json());

StatusRouter.post('/', async (req: StatusPostRequest, res) => {
    if (!req.body.email || typeof req.body.email !== 'string') return res.status(400).end();
    if (!('quizStatus' in req.body) || typeof req.body.quizStatus !== 'boolean')
        return res.status(400).end();

    console.log('Quiz Status', req.body.email, req.body.quizStatus);

    await upsertQuizStatus(req.body.email, req.body.quizStatus);

    res.status(204).end();
});

StatusRouter.get('/', async (req, res) => {
    if (!req.query.email) return res.status(400).end();
    const email = req.query.email.toString();
    res.json(getQuizStatus(email));
});

export default StatusRouter;
