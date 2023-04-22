import { Router } from 'express';
import { fetchItAll } from '../util/MongoUtil';
import FrequencyCouter from '../util/FrequencyCounter';
import { getThreadsForUser, normaliseThreads as normalizeThreads } from '../util/AirtableUtil';
import AirtableBase from '../util/airtable';

const DiscussionRouter = Router();

const SillyCache = new Map();

setInterval(() => {
    SillyCache.clear();
}, 120_000); // 2 minutes

DiscussionRouter.get('/', async (req, res) => {
    console.log('Fetching postable channels');

    if (SillyCache.has(req.originalUrl)) {
        console.log('Serving cached data');
        return res.status(200).json(SillyCache.get(req.originalUrl)).end();
    }

    console.log('Querying data from Airtable');

    const q = req.query.q;
    const channelId = req.query.channelId;

    let formulas = [];
    if (q) {
        formulas.push(`REGEX_MATCH({Thread Name}, '.*${q}.*')`);
    }
    if (channelId) {
        formulas.push(
            `{Link} = "https://ptb.discord.com/channels/913873017287884830/${channelId}"`
        );
    }

    const data = await AirtableBase('Table 1')
        .select({
            filterByFormula: formulas.length > 0 ? `AND(${formulas.join(', ')})` : 'TRUE()'
        })
        .firstPage()
        .then(x =>
            x.map(rec => ({
                _id: rec.id,
                id: (rec.fields['Link'] as string).split('/').pop(),
                name: rec.fields['Thread Name']
            }))
        );

    SillyCache.set(req.originalUrl, data);

    console.log('Serving queried data');
    res.status(200).json(data).end();
});

export default DiscussionRouter;
