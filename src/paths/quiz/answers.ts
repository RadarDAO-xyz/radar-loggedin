import { Request, Router, json } from 'express';
import { QuizAnswer, getAnswers, upsertAnswer } from '../../util/QuizStorage';

const AnswersRouter = Router();

AnswersRouter.use(json());

interface AnswersPostRequest extends Request {
    body: Partial<{
        email: string;
        question: number;
        answer: QuizAnswer;
    }>;
}

const questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const answers = ['a', 'b', 'c', 'd', 'e'];

AnswersRouter.post('/', async (req: AnswersPostRequest, res) => {
    if (!req.body.email || typeof req.body.email !== 'string') return res.status(400);
    if (!req.body.question || questions.includes(req.body.question)) return res.status(400);
    if (!req.body.answer || answers.includes(req.body.answer)) return res.status(400);

    // Upsert answers entry for question
    const answersRow = await upsertAnswer(req.body.email, req.body.question, req.body.answer);

    res.json(answersRow); // Return entire row as json
});

AnswersRouter.get('/', async (req, res) => {
    if (!req.query.email) return res.status(400);
    const email = req.query.email.toString();
    res.json(await getAnswers(email)); // Return entire answers row as json
});

export default AnswersRouter;
