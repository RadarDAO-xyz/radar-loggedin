import { Router } from 'express';
import { fetchItAll, fetchTotalShared } from '../util/MongoUtil';
import FrequencyCouter from '../util/FrequencyCounter';

const UserRouter = Router();

const SillyCache = new Map();

setInterval(() => {
    SillyCache.clear();
}, 120_000); // 2 minutes

UserRouter.use('/:id', async (req, res) => {
    const userId = req.params.id;
    console.log('Fetching profile for user ' + userId);

    if (SillyCache.has(req.originalUrl)) {
        console.log('Serving cached data');
        return res.status(200).json(SillyCache.get(req.originalUrl)).end();
    }

    console.log('Querying data from DB');

    const offset = parseInt(`${req.query.offset}`) || 0;
    const limit = parseInt(`${req.query.limit}`) || 50;

    const tags = req.query.tags?.toString().split(',') || [];

    const q = req.query.q?.toString() || '';

    const all = await fetchItAll(userId, q, tags);

    const data: Record<string, any> = {
        signals: all.slice(offset, offset + limit)
    };

    if (!q && tags.length == 0) {
        const idToNameMap = new Map();
        const freq = new FrequencyCouter();

        all.forEach(x => {
            freq.countUp(x.channel.discord_id);
            idToNameMap.set(x.channel.discord_id, x.channel.name);
        });

        data.total_shared = all.length;
        data.top_five = freq
            .sortDesc()
            .slice(0, 5)
            .map(x => ({ id: x[0], name: idToNameMap.get(x[0]), count: x[1] }));
    }

    SillyCache.set(req.originalUrl, data);

    console.log('Serving queried data');
    res.status(200).json(data).end();
});

export default UserRouter;
