// ============================================
// 🚀 Cafe-X POS - Production Environment
// ============================================
// Production configuration for Cafe-X POS System
// Contains production-ready settings and secure configurations
// ============================================

export const environment = {
  production: true,
  name: 'production',

  // ============================================
  // APPLICATION CONFIGURATION
  // ============================================
  app: {
    name: 'Cafe-X POS',
    version: '1.0.0',
    environment: 'production',
    debug: false,
    logLevel: 'error'
  },

  // ============================================
  // API CONFIGURATION
  // ============================================
  api: {
    baseUrl: 'https://api.cafexpos.com/api',
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 2000
  },

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================
  database: {
    type: 'postgres',
    host: process.env['DB_HOST'] || 'cafex-prod-db.cluster-xyz.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: process.env['DB_NAME'] || 'cafe_x_pos_prod',
    username: process.env['DB_USERNAME'] || 'cafex_prod_user',
    password: process.env['DB_PASSWORD'] || '',
    synchronize: false,
    logging: false,
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

  // ============================================
  // AUTHENTICATION & SECURITY
  // ============================================
  auth: {
    jwtSecret: process.env['JWT_SECRET'] || 'cafe-x-pos-prod-jwt-secret-key-2024',
    jwtExpiresIn: '12h',
    refreshTokenExpiresIn: '30d',
    bcryptRounds: 12,
    sessionTimeout: 7200000, // 2 hours in milliseconds
    maxLoginAttempts: 3,
    lockoutDuration: 1800000 // 30 minutes in milliseconds
  },

  // ============================================
  // PAYMENT GATEWAYS
  // ============================================
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

  // ============================================
  // EMAIL SERVICE CONFIGURATION
  // ============================================
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

  // ============================================
  // FILE UPLOAD CONFIGURATION
  // ============================================
  upload: {
    maxFileSize: 10485760, // 10MB in bytes
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: '/var/www/cafex/uploads',
    menuImagesPath: '/var/www/cafex/uploads/menu',
    profileImagesPath: '/var/www/cafex/uploads/profiles'
  },

  // ============================================
  // EXTERNAL SERVICE INTEGRATIONS
  // ============================================
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

  // ============================================
  // CACHE & PERFORMANCE
  // ============================================
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

  // ============================================
  // MONITORING & LOGGING
  // ============================================
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

  // ============================================
  // BUSINESS RULES
  // ============================================
  business: {
    minimumOrderValue: 100,
    freeDeliveryThreshold: 500,
    serviceChargePercentage: 5,
    gstPercentage: 18,
    maxDiscountPercentage: 30,
    loyaltyPointsPerRupee: 1,
    reservationAdvanceHours: 4,
    tableTurnoverTime: 60 // minutes
  },

  // ============================================
  // FEATURE FLAGS
  // ============================================
  features: {
    onlineOrdering: true,
    loyaltyProgram: true,
    reservations: true,
    analytics: true,
    multiLanguage: true,
    darkMode: true,
    notifications: true,
    integrations: true
  },

  // ============================================
  // CDN & STATIC ASSETS
  // ============================================
  cdn: {
    enabled: true,
    baseUrl: 'https://cdn.cafexpos.com',
    imageOptimization: true,
    regions: ['us-east-1', 'eu-west-1', 'ap-south-1']
  },

  // ============================================
  // BACKUP & DISASTER RECOVERY
  // ============================================
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

  // ============================================
  // RATE LIMITING
  // ============================================
  rateLimit: {
    windowMs: 900000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  }
};