import { Router } from 'express';
import { fetchItAll } from '../util/MongoUtil';
import FrequencyCouter from '../util/FrequencyCounter';
import {
    getThreadsForUser,
    normaliseThreads,
    normaliseThreads as normalizeThreads
} from '../util/AirtableUtil';
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
    const channelName = req.query.channelId;

    let formulas = [];
    if (q) {
        formulas.push(`FIND(LOWER('${q}'), LOWER({Thread Name}))`);
    }
    if (channelName) {
        formulas.push(`{Signal Channel} = '${channelName}'`);
    }

    console.log(formulas.length > 0 ? `AND(${formulas.join(', ')})` : 'TRUE()');

    const data = await AirtableBase('Table 1')
        .select({
            filterByFormula: formulas.length > 0 ? `AND(${formulas.join(', ')})` : 'TRUE()'
        })
        .firstPage()
        .then(x => normaliseThreads(x));

    SillyCache.set(req.originalUrl, data);

    console.log('Serving queried data');
    res.status(200).json(data).end();
});

export default DiscussionRouter;
