import Airtable from 'airtable';

Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });

const AirtableBase = Airtable.base(process.env.AIRTABLE_BASE_ID);

export default AirtableBase;
