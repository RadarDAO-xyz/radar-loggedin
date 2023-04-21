import { Records } from 'airtable/lib/records';
import AirtableBase from './airtable';
import { FieldSet } from 'airtable/lib/field_set';

export async function getThreadsForUser(curatorId: string) {
    return AirtableBase('Table 1')
        .select({
            filterByFormula: `{curatorId} = "${curatorId}"`,
            view: 'Sorted By Time'
        })
        .all();
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
        curator_id: r.fields['curatorId']
    }));
}
