import Airtable, { FieldSet, Record } from 'airtable';

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

const QuizStorage = Airtable.base(process.env.AIRTABLE_QUIZ_STORAGE);

const emailFilter = (e: string) => `LOWER({Email}) = LOWER("${e}")`;

export async function getQuizStatus(email: string) {
    return QuizStorage.table('Quiz Status')
        .select({
            filterByFormula: emailFilter(email)
        })
        .all()
        .then(x => x[0]);
}

export async function createQuizStatus(email: string, quizStatus: boolean) {
    return QuizStorage.table('Quiz Status').create(
        {
            Email: email,
            'Quiz Status': quizStatus ? 'ENABLED' : 'DISABLED'
        },
        { typecast: true }
    );
}

export async function upsertQuizStatus(email: string, quizStatus: boolean) {
    const existing = await getQuizStatus(email);

    if (existing) {
        return QuizStorage.table('Quiz Status').update(
            existing.id,
            {
                'Quiz Status': quizStatus ? 'ENABLED' : 'DISABLED'
            },
            { typecast: true }
        );
    } else {
        return createQuizStatus(email, quizStatus);
    }
}

export async function resolveAnswersRecord(recordIdOrRecord: string | Record<FieldSet>) {
    if (typeof recordIdOrRecord === 'string') {
        return QuizStorage('Table 1').find(recordIdOrRecord);
    } else {
        return recordIdOrRecord;
    }
}

export function normalizeAnswers(answers: Record<FieldSet> | undefined) {
    if (!answers) return [];

    const newAnswers = [];

    for (const k in answers.fields) {
        if (isNaN(k as unknown as number)) continue;
        newAnswers.push({ question: parseInt(k), answer: answers.fields[k] });
    }

    return newAnswers;
}

export async function getAnswers(email: string): Promise<Record<FieldSet> | undefined> {
    return QuizStorage.table('Answers')
        .select({
            filterByFormula: emailFilter(email)
        })
        .all()
        .then(x => x[0]);
}

export async function createAnswers(email: string): Promise<Record<FieldSet>>;
export async function createAnswers(
    email: string,
    q: string,
    a: QuizAnswer
): Promise<Record<FieldSet>>;
export async function createAnswers(email: string, q?: string, a?: QuizAnswer) {
    return QuizStorage.table('Answers').create(q ? { Email: email, [q]: a } : { Email: email }, {
        typecast: true
    });
}

export type QuizAnswer = 'a' | 'b' | 'c' | 'd' | 'e';

export async function setAnswer(record: string | Record<FieldSet>, q: string, a: QuizAnswer) {
    const existing = await resolveAnswersRecord(record);

    return QuizStorage.table('Answers').update(
        existing.id,
        {
            [q]: a
        },
        { typecast: true }
    );
}

export async function upsertAnswer(email: string, q: string, a: QuizAnswer) {
    const answers = await getAnswers(email);
    if (!answers) {
        return createAnswers(email, q, a);
    } else {
        return setAnswer(answers, q, a);
    }
}

export function normalizeArchetype(archetype: Record<FieldSet>) {
    return {
        id: archetype.fields['Archetype ID'],
        name: archetype.fields['Archetype Name'],
        description: archetype.fields['Archetype Description'],
        image: archetype.fields['Archetype Image URL'],
        url: archetype.fields['Archetype URL']
    };
}

export async function getArchetypes() {
    return QuizStorage.table('Archetypes').select().all();
}

export async function getResult(email: string) {
    return QuizStorage.table('Results')
        .select({ filterByFormula: emailFilter(email) })
        .all()
        .then(x => x[0]);
}

export type PartialArchetype = { id: number; name: string };

export async function createResult(email: string, archetype: PartialArchetype) {
    return QuizStorage.table('Results').create(
        {
            Email: email,
            Archetype: archetype.id.toString(),
            'Archetype Name': archetype.name
        },
        { typecast: true }
    );
}

export async function upsertResult(email: string, archetype: PartialArchetype) {
    const existing = await getResult(email);

    if (existing) {
        return QuizStorage.table('Results').update(
            existing.id,
            {
                Archetype: archetype.id.toString(),
                'Archetype Name': archetype.name
            },
            { typecast: true }
        );
    } else {
        return createResult(email, archetype);
    }
}

export type PartialAttachment = {
    url: string;
    filename: string;
};

export type PartialSubmission = {
    name: string;
    age?: number;
    location: string;
    task: string;
    attachment?: PartialAttachment;
};

export async function createSubmission(submission: PartialSubmission) {
    return QuizStorage.table('Wall of Play').create(
        {
            Name: submission.name,
            Age: submission.age,
            Location: submission.location,
            Task: submission.task,
            Attachment: [submission.attachment] as any
        },
        { typecast: true }
    );
}

export async function getSubmissions(filterApproved = true) {
    return QuizStorage.table('Wall of Play')
        .select({
            filterByFormula: filterApproved ? '{Approved} = TRUE()' : 'TRUE()'
        })
        .all();
}

export default QuizStorage;
