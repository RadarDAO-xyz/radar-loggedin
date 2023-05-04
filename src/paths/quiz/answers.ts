import { Request, Router, json } from 'express';

const AnswersRouter = Router();

AnswersRouter.use(json());

interface AnswersPostRequest extends Request {
    body: Partial<{
        email: string;
        question: number;
        answer: 'a' | 'b' | 'c' | 'd' | 'e';
    }>;
}

const questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const answers = ['a', 'b', 'c', 'd', 'e'];

AnswersRouter.post('/', (req: AnswersPostRequest, res) => {
    if (!req.body.email || typeof req.body.email !== 'string') return res.status(400);
    if (!req.body.question || questions.includes(req.body.question)) return res.status(400);
    if (!req.body.answer || answers.includes(req.body.answer)) return res.status(400);

    // Upsert answers entry for question

    res.json(); // Return entire row as json
});

AnswersRouter.get('/', (req, res) => {
    if (!req.query.email) return res.status(400);
    // const email = req.query.email.toString();
    res.json(); // Return entire answers row as json
});

export default AnswersRouter;
