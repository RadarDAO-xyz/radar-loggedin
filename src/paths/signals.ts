import { Router } from 'express';
import UserRouter from './signals/user';
import ChannelRouter from './signals/channels';
import DiscussionRouter from './signals/discussions';
import isMemberRouter from './signals/isMember';

const SignalsRouter = Router();

SignalsRouter.use('/user', UserRouter);
SignalsRouter.use('/channels', ChannelRouter);
SignalsRouter.use('/discussions', DiscussionRouter);
SignalsRouter.use('/isMember', isMemberRouter);

export default SignalsRouter;
