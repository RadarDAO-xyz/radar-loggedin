import Airtable from 'airtable';
import { Records } from 'airtable/lib/records';
import { FieldSet } from 'airtable/lib/field_set';
import { ForumChannel, SnowflakeUtil, ThreadChannel, User } from 'discord.js';
import { RawUserData } from 'discord.js/typings/rawDataTypes';

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

const SignalThreads = Airtable.base(process.env.AIRTABLE_SIGNAL_THREADS);

export default SignalThreads;

/**
 * Fetches all discussions for a curator
 */
export async function getThreadsForUser(curatorId: string) {
    return SignalThreads('Table 1')
        .select({
            filterByFormula: `{curatorId} = "${curatorId}"`,
            view: 'Sorted By Time'
        })
        .all();
}

/**
 * Inserts a dscussion entry into the airtable
 */
export async function insertThread(
    thread: ThreadChannel,
    channel: ForumChannel,
    tags: string[],
    curator: RawUserData | User
) {
    return SignalThreads('Table 1').create(
        {
            'Thread Name': thread.name,
            Link: `https://ptb.discord.com/channels/913873017287884830/${thread.id}`,
            'Signal Channel': channel.name,
            Tags: tags,
            Curator: curator.username + '#' + curator.discriminator,
            Comments: 1,
            Timestamp: SnowflakeUtil.deconstruct(thread.id).timestamp.toString(),
            curatorId: curator.id,
            channelId: channel.id,
            threadId: thread.id
        },
        { typecast: true }
    );
}

/**
 * Turns the airtable result into usable json
 */
export function normaliseThreads(results: Records<FieldSet>) {
    return results.map(r => ({
        _id: r.id,
        thread_name: r.fields['Thread Name'],
        channel_name: r.fields['Signal Channel'],
        curator_tag: r.fields['Curator'],
        status: r.fields['Status'],
        link: r.fields['Link'],
        comments: r.fields['Comments'],
        timestamp: r.fields['Timestamp'],
        curator_id: r.fields['curatorId'],
        channel_id: r.fields['channelId'],
        thread_id: r.fields['threadId']
    }));
}
