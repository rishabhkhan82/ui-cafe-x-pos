// ============================================
// 🚀 Cafe-X POS - Production Environment
// ============================================
// Production configuration for Cafe-X POS System
// Contains production-ready settings and secure configurations
// ============================================

export const environment = {
  production: true,
  name: 'production',
  app: {
    name: 'Cafe-X POS',
    version: '1.0.0',
    environment: 'production',
    debug: false,
    logLevel: 'error'
  },
  api: {
    baseUrl: 'http://localhost:8080/api',
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 2000
  },
  database: {
    type: 'mysql',
    host: 'mysql-db-cafe-x-pos-db-cafe-x-pos.i.aivencloud.com',
    port: 24532,
    database: 'db-cafe-x-pos',
    password: 'AVNS_Y5-1K_WBIkCWaTsizh9',
    synchronize: true,
    logging: true,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    subscribers: ['dist/subscribers/*{.ts,.js}'],
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  auth: {
    jwtSecret: process.env['JWT_SECRET'] || 'db-cafe-x-pos-jwt-secret-key-2025',
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '30d',
    bcryptRounds: 12,
    sessionTimeout: 7200000, // 2 hours in milliseconds
    maxLoginAttempts: 3,
    lockoutDuration: 1800000 // 30 minutes in milliseconds
  },
  payment: {
    stripe: {
      publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] || '',
      secretKey: process.env['STRIPE_SECRET_KEY'] || '',
      webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || ''
    },
    razorpay: {
      keyId: process.env['RAZORPAY_KEY_ID'] || '',
      keySecret: process.env['RAZORPAY_KEY_SECRET'] || '',
      webhookSecret: process.env['RAZORPAY_WEBHOOK_SECRET'] || ''
    },
    defaultGateway: 'razorpay',
    testMode: false
  },
  email: {
    provider: 'sendgrid',
    apiKey: process.env['SENDGRID_API_KEY'] || '',
    fromEmail: 'noreply@cafexpos.com',
    fromName: 'Cafe-X POS',
    templates: {
      orderConfirmation: 'p-cafe-x-order-confirmation',
      passwordReset: 'p-cafe-x-password-reset',
      welcomeEmail: 'p-cafe-x-welcome'
    }
  },
  upload: {
    maxFileSize: 5242880, // 5MB in bytes
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: './uploads',
    menuImagesPath: './uploads/menu',
    profileImagesPath: './uploads/profiles'
  },
  integrations: {
    zomato: {
      apiKey: process.env['ZOMATO_API_KEY'] || '',
      apiSecret: process.env['ZOMATO_API_SECRET'] || '',
      webhookUrl: 'https://api.cafexpos.com/webhooks/zomato'
    },
    swiggy: {
      apiKey: process.env['SWIGGY_API_KEY'] || '',
      apiSecret: process.env['SWIGGY_API_SECRET'] || '',
      webhookUrl: 'https://api.cafexpos.com/webhooks/swiggy'
    }
  },
  cache: {
    enabled: true,
    ttl: 1800, // 30 minutes
    maxItems: 10000,
    redis: {
      host: process.env['REDIS_HOST'] || 'cafex-cache.cluster-xyz.ng.0001.use1.cache.amazonaws.com',
      port: 6379,
      password: process.env['REDIS_PASSWORD'] || '',
      db: 0
    }
  },
  monitoring: {
    enabled: true,
    sentry: {
      dsn: process.env['SENTRY_DSN'] || 'https://cafe-x-pos-prod-sentry-dsn@sentry.io/project-id'
    },
    datadog: {
      apiKey: process.env['DATADOG_API_KEY'] || '',
      appKey: process.env['DATADOG_APP_KEY'] || ''
    }
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: 30, // days
    s3: {
      bucket: 'cafex-pos-backups',
      region: 'us-east-1',
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || ''
    }
  },
};