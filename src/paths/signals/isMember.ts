import { Router } from 'express';
import DiscordClient from '../util/discord';

const isMemberRouter = Router();

isMemberRouter.get('/:id', async (req, res) => {
    console.log('Checking if user', req.params.id, 'is member of RADAR');

    const member = await DiscordClient.guilds.cache
        .get('913873017287884830')
        ?.members.fetch(req.params.id);

    console.log('User', req.params.id, 'member of RADAR?', !!member);

    res.status(200).json({ is_member: !!member }).end();
});

export default isMemberRouter;
