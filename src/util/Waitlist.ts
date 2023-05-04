import Airtable, { FieldSet, Record } from 'airtable';

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

const Waitlist = Airtable.base(process.env.AIRTABLE_WAITLIST);

export default Waitlist;

export type WaitingForName = 'RADAR Discover' | 'RADAR Launch' | 'More play-full future';

export function getExistingWailist(email: string) {
    return Waitlist('Table 1')
        .select({
            filterByFormula: `LOWER({Email}) = LOWER("${email}")`
        })
        .all()
        .then(x => x[0]);
}

/**
 * Inserts an email into the radar waitlist
 */
export async function insertWaitlist({
    email,
    waitingFor
}: {
    email: string;
    waitingFor: WaitingForName | WaitingForName[];
}) {
    return Waitlist('Table 1').create(
        {
            Email: email,
            'Waiting for:': [waitingFor].flat()
        },
        { typecast: true }
    );
}

export async function resolveRecord(recordIdOrRecord: string | Record<FieldSet>) {
    if (typeof recordIdOrRecord === 'string') {
        return Waitlist('Table 1').find(recordIdOrRecord);
    } else {
        return recordIdOrRecord;
    }
}

/**
 * Inserts an email into the radar waitlist
 */
export async function addWaitlist(
    record: string | Record<FieldSet>,
    waitingFor: WaitingForName | WaitingForName[]
) {
    const existing = await resolveRecord(record);
    return Waitlist('Table 1').update(existing.id, {
        'Waiting for:': [
            ...(existing.fields['Waiting for:'] as readonly string[]),
            ...[waitingFor].flat()
        ]
    });
}
