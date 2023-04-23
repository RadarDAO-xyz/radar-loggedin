import { DB } from './db';

/**
 * Profile fetcher (fetches everything)
 */
export async function fetchItAll(userId: string, q = '', tags: string[] = []) {
    const matchStage: Record<string, any> = {
        'messages.data.author.id': userId,
        $or: [
            {
                'data.title': new RegExp(`\\b${q}\\b`, 'i')
            },
            {
                'data.description': new RegExp(`\\b${q}\\b`, 'i')
            },
            {
                tags_downcase: new RegExp(`\\b${q}\\b`, 'i')
            }
        ]
    };

    if (tags.length > 0) {
        matchStage.tags_downcase = { $in: tags };
    }

    const agg = [
        {
            $lookup: {
                from: 'messages',
                localField: 'message_id',
                foreignField: '_id',
                as: 'messages'
            }
        },
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: 'channels',
                localField: 'channel_id',
                foreignField: '_id',
                as: 'channels'
            }
        },
        {
            $set: {
                channel: {
                    $first: '$channels'
                },
                message: {
                    $first: '$messages'
                }
            }
        },
        {
            $unset: ['messages', 'channels']
        },
        {
            $sort: {
                posted_at: -1
            }
        }
    ];

    const cursor = DB.collection('links').aggregate(agg);
    const result = await cursor.toArray();

    return result;
}
