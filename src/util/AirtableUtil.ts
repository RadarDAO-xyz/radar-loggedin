import { Records } from 'airtable/lib/records';
import AirtableBase from './airtable';
import { FieldSet } from 'airtable/lib/field_set';
import { ForumChannel, SnowflakeUtil, ThreadChannel, User } from 'discord.js';
import { RawUserData } from 'discord.js/typings/rawDataTypes';

export async function getThreadsForUser(curatorId: string) {
    return AirtableBase('Table 1')
        .select({
            filterByFormula: `{curatorId} = "${curatorId}"`,
            view: 'Sorted By Time'
        })
        .all();
}

export async function insertThread(
    thread: ThreadChannel,
    channel: ForumChannel,
    tags: string[],
    curator: RawUserData | User
) {
    return AirtableBase('Table 1').create(
        {
            'Thread Name': thread.name,
            Link: `https://ptb.discord.com/channels/913873017287884830/${thread.id}`,
            'Signal Channel': channel.name,
            Tags: tags,
            Curator: curator.username + '#' + curator.discriminator,
            Timestamp: SnowflakeUtil.deconstruct(thread.id).timestamp.toString(),
            curatorId: curator.id,
            channelId: channel.id,
            threadId: thread.id
        },
        { typecast: true }
    );
}

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
