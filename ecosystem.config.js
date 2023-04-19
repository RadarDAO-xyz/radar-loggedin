module.exports = {
    apps: [
        {
            name: 'API',
            script: './js/index.js',
            env_production: {
                NODE_ENV: 'production'
            },
            env_development: { // UNUSED
                NODE_ENV: 'development',
                PORT: 3000
            }
        }
    ]
};
