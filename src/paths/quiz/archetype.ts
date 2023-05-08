import { Router } from 'express';
import {
    getAnswers,
    getArchetypes,
    normalizeAnswers,
    normalizeArchetype,
    upsertResult
} from '../../util/QuizStorage';
import FrequencyCouter from '../../util/FrequencyCounter';
import Airtable, { FieldSet } from 'airtable';

const ArchetypeRouter = Router();

type AnswerFrequencies = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
};

const pures = [1, 2, 3, 4, 5];
const answers = ['a', 'b', 'c', 'd', 'e'] as (keyof AnswerFrequencies)[];

const between = (l: number, n: number | undefined, h: number) => (n ? n >= l && n <= h : false);

/**
 * This determines the Archetype based on answer frequencies
 * @param percentages
 * @returns
 */
function determineArchetype(percentages: AnswerFrequencies) {
    for (let i = 0; i < 5; i++) {
        const id = pures[i];
        const answer = answers[i];
        const percentage = percentages[answer];
        const percentageNext = (x: number) => percentages[answers[i + x]];

        if (percentage >= 80) return id; // 8+ X is pure
        if (between(40, percentage, 50) && between(40, percentageNext(1), 70)) return id + 10; // 4-5 X and 4-5 Y1 is XY1
        if (between(40, percentage, 50) && between(40, percentageNext(2), 70)) return id + 14; // 4-5 X and 4-5 Y2 is XY2
        if (between(40, percentage, 50) && between(40, percentageNext(3), 70)) return id + 17; // 4-5 X and 4-5 Y3 is XY3
        if (between(40, percentage, 50) && between(40, percentageNext(4), 70)) return id + 19; // 4-5 X and 4-5 Y4 is XY4
        if (between(40, percentage, 70)) return id + 5; // 4-7 X is X mix
    }
    return 21; // All answer frequencies are 3 or <3
}

ArchetypeRouter.get('/', async (req, res) => {
    if (!req.query.email) return res.status(400).end();
    const email = req.query.email.toString();

    // Fetch answers
    const answers = await getAnswers(email);

    if (!answers || normalizeAnswers(answers)?.length == 0) return res.json([]);

    // Fetch archetypes
    const archetypes = await getArchetypes();

    // Calculate frequency percentages
    const frequencyCounter = new FrequencyCouter();

    for (let i = 1; i <= 10; i++) {
        frequencyCounter.countUp(answers.fields[i.toString()] as string);
    }

    const percentages = Object.assign(
        { a: 0, b: 0, c: 0, d: 0, e: 0 },
        frequencyCounter
            .sortAsc()
            .map(x => [x[0], Math.round((x[1] / frequencyCounter.totalCounted) * 100)])
            .reduce((acc, curr) => {
                (acc as any)[curr[0]] = curr[1];
                return acc;
            }, {})
    ) as AnswerFrequencies;

    // Calculate Archetype (TODO)
    const archetypeId = determineArchetype(percentages);

    const archetype = archetypes.find(
        a => a.fields['Archetype ID'] === archetypeId
    ) as Airtable.Record<FieldSet>;

    // Store result in Airtable
    await upsertResult(email, {
        id: archetype.fields['Archetype ID'] as number,
        name: archetype.fields['Archetype Name'] as string
    });

    // Return Archetype and result percentages as json
    res.json({
        archetype: normalizeArchetype(archetype),
        resultPs: percentages
    });
});

export default ArchetypeRouter;
