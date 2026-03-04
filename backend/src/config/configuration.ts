export default () => ({
  port: parseInt(process.env.BACKEND_PORT ?? '3001', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER ?? 'gamecenter',
    password: process.env.POSTGRES_PASSWORD ?? 'gamecenterpass',
    name: process.env.POSTGRES_DB ?? 'gamecenterdb',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change_this_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change_this_refresh_secret',
    expiration: process.env.JWT_EXPIRATION ?? '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
});
