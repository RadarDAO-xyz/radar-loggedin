import { Request, Router, json } from 'express';
import formidable from 'formidable';
import { mkdir, rmdir } from 'fs/promises';
import path from 'path';
import { PartialSubmission, createSubmission, getSubmissions } from '../../util/QuizStorage';
import { Attachment } from 'airtable';
import { existsSync } from 'fs';

const tempFolder = path.join(process.cwd(), './.temp');

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

WallOfPlayRouter.use(json());

const allowedExtensions = [
    'png',
    'jpg',
    'jpeg',
    'webp',
    'mp4',
    'mov',
    'webm',
    'mp3',
    'wav',
    'mpeg'
];

WallOfPlayRouter.post('/', async (req: WallOfPlayPostRequest, res, next) => {
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
        if (!fields.name || typeof fields.name !== 'string') return res.status(400).end();
        if (fields.age && typeof fields.age !== 'string') return res.status(400).end();
        if (fields.age && isNaN(fields.age as unknown as number)) return res.status(400).end();
        if (!fields.location || typeof fields.location !== 'string') return res.status(400).end();
        if (!fields.task || typeof fields.task !== 'string') return res.status(400).end();
        if (Array.isArray(files.attachment)) return res.sendStatus(415);
        if (
            !files.attachment.originalFilename ||
            !allowedExtensions.includes(
                files.attachment.originalFilename?.split('.').pop() as string
            )
        )
            return res.sendStatus(415);
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
        res.status(204).end();
    });
});

WallOfPlayRouter.get('/', async (req, res) => {
    const submissions = await getSubmissions();
    res.json(
        submissions.map(x => ({
            name: x.fields.Name,
            age: x.fields.Age,
            location: x.fields.Location,
            task: x.fields.Task,
            attachment: (x.fields.Attachment as Attachment[])?.[0]
        }))
    );
});

export default WallOfPlayRouter;
