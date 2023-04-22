import { Router } from 'express';
import AirtableBase from '../util/airtable';

const ChannelRouter = Router();

const SillyCache = new Map();

setInterval(() => {
    SillyCache.clear();
}, 120_000); // 2 minutes

ChannelRouter.get('/', async (req, res) => {
    console.log('Fetching postable channels');

    if (SillyCache.has(req.originalUrl)) {
        console.log("Serving cached data");
        return res.status(200).json(SillyCache.get(req.originalUrl)).end();
    }

    console.log('Querying data from Airtable');

    const data = await AirtableBase('Tracked Channels')
        .select()
        .all()
        .then(x =>
            x.map(rec => ({ id: rec.fields['Channel ID'], name: rec.fields['Channel Name'] }))
        );

    SillyCache.set(req.originalUrl, data);

    console.log('Serving queried data');
    res.status(200).json(data).end();
});

export default ChannelRouter;
