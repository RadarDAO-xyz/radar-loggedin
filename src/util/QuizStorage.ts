import Airtable from 'airtable';

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

const QuizStorage = Airtable.base(process.env.AIRTABLE_QUIZ_STORAGE);

export async function getQuizStatus(email: string) {
    return QuizStorage.table('Quiz Status')
        .select({
            filterByFormula: `{Email} = "${email}"`
        })
        .all()
        .then(x => x[0]);
}

export async function setQuizStatus(email: string, quizStatus: boolean) {
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
        return QuizStorage.table('Quiz Status').update(existing.id, {
            Email: email,
            'Quiz Status': quizStatus
        });
    } else {
        return setQuizStatus(email, quizStatus);
    }
}

export default QuizStorage;
