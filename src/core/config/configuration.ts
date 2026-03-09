/**
 * Application configuration with environment variable validation
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

export interface DatabaseConfig {
  url: string;
}

export interface AuthConfig {
  betterAuthSecret: string;
  betterAuthUrl: string;
  callbackUrl: string;
}

export interface RedisConfig {
  url: string;
  restUrl: string;
  restToken: string;
}

export interface CorsConfig {
  allowedOrigins: string[];
}

export interface ThrottlerConfig {
  ttl: number;
  limit: number;
}

export default () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    app: {
      port: parseInt(process.env.PORT || '3001', 10),
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development',
      isTest: nodeEnv === 'test',
    } as AppConfig,

    database: {
      url: process.env.DATABASE_URL || '',
    } as DatabaseConfig,

    auth: {
      betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
      betterAuthUrl: process.env.BETTER_AUTH_URL || '',
      callbackUrl: process.env.AUTH_CALLBACK_URL || '',
    } as AuthConfig,

    redis: {
      url: process.env.REDIS_URL || '',
      restUrl: process.env.UPSTASH_REDIS_REST_URL || '',
      restToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    } as RedisConfig,

    cors: {
      allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((origin) =>
          origin
            .trim()
            .replace(/^['"]|['"]$/g, '')
            .replace(/\/$/, ''),
        ),
    } as CorsConfig,

    throttler: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    } as ThrottlerConfig,
  };
};
