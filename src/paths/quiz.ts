import { Router } from 'express';
import AnswersRouter from './quiz/answers';
import ArchetypeRouter from './quiz/archetype';
import StatusRouter from './quiz/status';

const QuizRouter = Router();

QuizRouter.use('/answers', AnswersRouter);
QuizRouter.use('/archetype', ArchetypeRouter);
QuizRouter.use('/status', StatusRouter);

export default QuizRouter;
