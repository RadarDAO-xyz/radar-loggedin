export {};

declare global {
    namespace NodeJS {
        interface Process {
            isTest: boolean;
            PROJECT_DIR: string;
        }
        interface ProcessEnv {
            MONGO_URL: string;
        }
    }
}
