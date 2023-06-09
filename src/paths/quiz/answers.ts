import { Request, Router, json } from 'express';
import { QuizAnswer, getAnswers, normalizeAnswers, upsertAnswer } from '../../util/QuizStorage';

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
    if (!req.body.email || typeof req.body.email !== 'string') return res.status(400).end();
    if (!req.body.question || !questions.includes(req.body.question)) return res.status(400).end();
    if (!req.body.answer || !answers.includes(req.body.answer)) return res.status(400).end();

    console.log('Posting new answer', req.body.email, req.body.question, req.body.answer);

    // Upsert answers entry for question
    const answersRow = await upsertAnswer(
        req.body.email,
        req.body.question.toString(),
        req.body.answer
    );

    res.json(normalizeAnswers(answersRow)); // Return entire row as json
});

AnswersRouter.get('/', async (req, res) => {
    if (!req.query.email) return res.status(400).end();
    const email = req.query.email.toString();

    const answers = await getAnswers(email);

    res.json(normalizeAnswers(answers)); // Return entire answers row as json
});

export default AnswersRouter;
