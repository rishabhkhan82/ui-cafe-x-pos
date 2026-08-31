// ============================================
// 🚀 Cafe-X POS - Production Environment
// ============================================

export const environment = {
  production: true,
  name: 'production',
  version: '1.0.1',
  app: {
    name: 'Cafe-X POS',
    version: '1.0.1',
    environment: 'production',
    debug: false,
    logLevel: 'error'
  },
  api: {
    baseUrl: '/api',
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 2000
  },
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'cafe_x_pos',
    username: 'cafex_user',
    password: 'Khan9511721668#',
    synchronize: false,
    logging: false,
    ssl: false
  },
  auth: {
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '30d',
    bcryptRounds: 12,
    sessionTimeout: 7200000,
    maxLoginAttempts: 3,
    lockoutDuration: 1800000
  },
  payment: {
    razorpay: {
      keyId: '',      // fill from backend or env during build if needed
      keySecret: ''
    },
    defaultGateway: 'razorpay',
    testMode: false
  },
  email: {
    fromEmail: 'noreply@cafexpos.com',
    fromName: 'Cafe-X POS'
  },
  upload: {
    maxFileSize: 5242880,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: '/uploads',
    menuImagesPath: '/uploads/menu',
    profileImagesPath: '/uploads/profiles'
  },
  integrations: {
    zomato: {
      webhookUrl: 'https://cafexpos.in/webhooks/zomato'
    },
    swiggy: {
      webhookUrl: 'https://cafexpos.in/webhooks/swiggy'
    }
  },
  cache: {
    enabled: true,
    ttl: 1800,
    maxItems: 10000
  },
  monitoring: {
    enabled: true
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: 30
  }
};