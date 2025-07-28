const config = {
    port: process.env.PORT || 4000,
    jwtSecret: process.env.JWT_SECRET || 'default-change-in-production',
    nodeEnv: process.env.NODE_ENV || 'production',
    dbPath: process.env.DB_PATH || './database.db'
};

module.exports = config;
