import { Router } from 'express';
import { getAnswers, getArchetypes, upsertResult } from '../../util/QuizStorage';
import FrequencyCouter from '../../util/FrequencyCounter';

const ArchetypeRouter = Router();

ArchetypeRouter.get('/', async (req, res) => {
    if (!req.query.email) return res.status(400);
    const email = req.query.email.toString();

    // Fetch answers
    const answers = await getAnswers(email);

    // Fetch archetypes
    const archetypes = await getArchetypes();

    // Calculate frequency percentages
    const frequencyCounter = new FrequencyCouter();

    for (let i = 1; i <= 10; i++) {
        frequencyCounter.countUp(answers.fields[i.toString()] as string);
    }

    const percentages = frequencyCounter
        .sortAsc()
        .map(x => [x[0], Math.round((x[1] / frequencyCounter.counter.size) * 100)])
        .reduce((acc, curr) => ((acc as any)[curr[0]] = curr[1]), {});

    // Calculate Archetype (TODO)
    const archetype = { id: 1, name: 'The Holy Developer' };

    // Store result in Airtable
    upsertResult(email, archetype);

    // Return Archetype and result percentages as json
    res.json({
        archetype: archetypes.find(a => a.fields.id === archetype.id),
        resultPs: percentages
    });
});

export default ArchetypeRouter;
