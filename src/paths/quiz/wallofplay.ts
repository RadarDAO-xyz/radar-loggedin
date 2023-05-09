import { Request, Router, json } from 'express';
import formidable from 'formidable';
import { mkdir, rmdir } from 'fs/promises';
import path from 'path';
import { PartialSubmission, createSubmission, getSubmissions } from '../../util/QuizStorage';
import { Attachment } from 'airtable';
import { existsSync } from 'fs';

const tempFolder = path.join(__dirname, '../../../temp');

if (existsSync(tempFolder)) rmdir(tempFolder).then(() => mkdir(tempFolder));
else mkdir(tempFolder);

setInterval(async () => {
    if (existsSync(tempFolder)) {
        await rmdir(tempFolder).catch();
        await mkdir(tempFolder).catch();
    }
}, 30 * 60 * 1000);

const WallOfPlayRouter = Router();

interface WallOfPlayPostRequest extends Request {
    body: Partial<{
        email: string;
        quizStatus: boolean;
    }>;
}

const SillyCache = new Map();

setInterval(() => {
    SillyCache.clear();
}, 120_000); // 2 minutes

WallOfPlayRouter.use(json());

const allowedExtensions = [
    // Image
    'png',
    'jpg',
    'jpeg',
    'webp',
    // Video
    'mp4',
    'mov',
    'webm',
    // Audio
    'mp3',
    'wav',
    'mpeg',
    'ogg'
];

WallOfPlayRouter.post('/', async (req: WallOfPlayPostRequest, res, next) => {
    const failRedir = (x: string) =>
        req.headers.origin +
        `/community-generated-content?success=false&reason=${encodeURIComponent(x)}`;
    const successRedir = req.headers.origin + '/community-generated-content?success=true';

    const fail = (x: string) => res.redirect(failRedir(x));

    const form = formidable({
        multiples: true,
        uploadDir: tempFolder,
        maxFiles: 1,
        maxTotalFileSize: 10 * 1024 * 1024 // 10mb
    });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        if (!fields.name || typeof fields.name !== 'string') return fail('Missing name');
        if (fields.age && typeof fields.age !== 'string') return fail('Invalid age');
        if (fields.age && isNaN(fields.age as unknown as number)) return fail('Invalid age');
        if (!fields.location || typeof fields.location !== 'string')
            return fail('Missing location');
        if (!fields.task || typeof fields.task !== 'string') return fail('Missing task');
        if (Array.isArray(files.attachment)) return fail('Invalid attachment');
        if (
            (files.attachment && !files.attachment.originalFilename) ||
            !allowedExtensions.includes(
                files.attachment.originalFilename?.split('.').pop() as string
            )
        )
            return fail(
                'Unsupported extension: ' + files.attachment.originalFilename?.split('.').pop()
            );
        const submission: PartialSubmission = {
            name: fields.name,
            age: fields.age ? parseInt(fields.age) : undefined,
            location: fields.location,
            task: fields.task,
            attachment: files.attachment
                ? {
                    url: `https://api.radardao.xyz/temp/${files.attachment.newFilename}`,
                    filename: files.attachment.originalFilename || files.attachment.newFilename
                }
                : undefined
        };
        await createSubmission(submission);
        res.redirect(successRedir);
        res.status(204).end();
    });
});

WallOfPlayRouter.get('/', async (req, res) => {
    if (SillyCache.has(req.originalUrl)) {
        console.log('Serving cached Wall of Play submissions');
        return res.json(SillyCache.get(req.originalUrl)).end();
    }

    console.log('Fetching data for Wall of Play submissions from the Airtable');

    const submissions = await getSubmissions();

    const data = submissions.map(x => ({
        name: x.fields.Name,
        age: x.fields.Age,
        location: x.fields.Location,
        task: x.fields.Task,
        attachment: (x.fields.Attachment as Attachment[])?.[0]
    }));

    SillyCache.set(req.originalUrl, data);

    res.json(data);
});

export default WallOfPlayRouter;
