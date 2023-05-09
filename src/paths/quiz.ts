import { Router } from 'express';
import AnswersRouter from './quiz/answers';
import ArchetypeRouter from './quiz/archetype';
import StatusRouter from './quiz/status';
import WallOfPlayRouter from './quiz/wallofplay';

const QuizRouter = Router();

QuizRouter.use('/answers', AnswersRouter);
QuizRouter.use('/archetype', ArchetypeRouter);
QuizRouter.use('/status', StatusRouter);
QuizRouter.use('/wallofplay', WallOfPlayRouter);

export default QuizRouter;
