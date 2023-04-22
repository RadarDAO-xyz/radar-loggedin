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
            AIRTABLE_BASE_ID: string;
            PORT?: string;
            NODE_ENV?: 'development' | 'production';
        }
    }
}
