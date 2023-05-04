/* eslint-disable @typescript-eslint/no-namespace */

export {};

declare global {
    namespace NodeJS {
        interface Process {
            isTest: boolean;
            PROJECT_DIR: string;
        }
        interface ProcessEnv {
            MONGO_URL: string;
            AIRTABLE_API_KEY: string;
            AIRTABLE_SIGNAL_THREADS: string;
            AIRTABLE_WAITLIST: string;
            AIRTABLE_QUIZ_STORAGE: string;
            PORT?: string;
            NODE_ENV?: 'development' | 'production';
        }
    }
}
