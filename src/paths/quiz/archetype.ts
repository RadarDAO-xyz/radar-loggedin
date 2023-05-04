import { Router } from 'express';

const ArchetypeRouter = Router();

ArchetypeRouter.get('/', (req, res) => {
    if (!req.query.email) return res.status(400);

    // Fetch answers

    // Calculate Archetype

    // Store in Airtable

    // Return Archetype as json
    res.json();
});

export default ArchetypeRouter;
