// ============================================
// 🌍 Cafe-X POS - Local Development Environment
// ============================================
// Local development configuration for Cafe-X POS System
// DO NOT commit sensitive data to version control
// ============================================

export const environment = {
  production: false,
  name: 'local',
  app: {
    name: 'Cafe-X POS',
    version: '1.0.0',
    environment: 'development',
    debug: true,
    logLevel: 'debug'
  },
  api: {
    baseUrl: 'http://localhost:8080/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3307,
    database: 'cafe_x_pos',
    username: 'root',
    password: 'CafeX_POS_2024!',
    synchronize: true,
    logging: true,
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    subscribers: ['src/subscribers/*{.ts,.js}']
  },
  auth: {
    jwtSecret: 'db-cafe-x-pos-jwt-secret-key-2025',
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '7d',
    bcryptRounds: 10,
    sessionTimeout: 3600000, // 1 hour in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 900000 // 15 minutes in milliseconds
  },
  payment: {
    stripe: {
      publishableKey: 'pk_test_cafe_x_pos_stripe_key',
      secretKey: 'sk_test_cafe_x_pos_stripe_secret',
      webhookSecret: 'whsec_cafe_x_pos_webhook_secret'
    },
    razorpay: {
      keyId: 'rzp_test_cafe_x_pos_key',
      keySecret: 'cafe_x_pos_razorpay_secret',
      webhookSecret: 'cafe_x_pos_razorpay_webhook'
    },
    defaultGateway: 'razorpay',
    testMode: true
  },
  email: {
    provider: 'sendgrid',
    apiKey: 'SG.cafe_x_pos_dev_email_key',
    fromEmail: 'noreply@cafexpos.dev',
    fromName: 'Cafe-X POS',
    templates: {
      orderConfirmation: 'd-cafe-x-order-confirmation',
      passwordReset: 'd-cafe-x-password-reset',
      welcomeEmail: 'd-cafe-x-welcome'
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
      apiKey: 'cafe_x_pos_zomato_dev_key',
      apiSecret: 'cafe_x_pos_zomato_dev_secret',
      webhookUrl: 'http://localhost:3000/webhooks/zomato'
    },
    swiggy: {
      apiKey: 'cafe_x_pos_swiggy_dev_key',
      apiSecret: 'cafe_x_pos_swiggy_dev_secret',
      webhookUrl: 'http://localhost:3000/webhooks/swiggy'
    }
  },
  cache: {
    enabled: false,
    ttl: 300, // 5 minutes
    maxItems: 1000
  },
  monitoring: {
    enabled: false,
    sentry: {
      dsn: 'https://cafe-x-pos-dev-sentry-dsn@sentry.io/project-id'
    }
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: 30, // days
    s3: {
      bucket: 'cafex-pos-backups',
      region: 'us-east-1',
      // accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
      // secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || ''
    }
  },
};