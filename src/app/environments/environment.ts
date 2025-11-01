// ============================================
// 🌍 Cafe-X POS - Local Development Environment
// ============================================
// Local development configuration for Cafe-X POS System
// DO NOT commit sensitive data to version control
// ============================================

export const environment = {
  production: false,
  name: 'local',

  // ============================================
  // APPLICATION CONFIGURATION
  // ============================================
  app: {
    name: 'Cafe-X POS',
    version: '1.0.0',
    environment: 'development',
    debug: true,
    logLevel: 'debug'
  },

  // ============================================
  // API CONFIGURATION
  // ============================================
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================
  database: {
    type: 'sqlite',
    host: 'localhost',
    port: 3306,
    database: 'cafe_x_pos_dev',
    username: 'root',
    password: '',
    synchronize: true,
    logging: true,
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    subscribers: ['src/subscribers/*{.ts,.js}']
  },

  // ============================================
  // AUTHENTICATION & SECURITY
  // ============================================
  auth: {
    jwtSecret: 'cafe-x-pos-dev-jwt-secret-key-2024',
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '7d',
    bcryptRounds: 10,
    sessionTimeout: 3600000, // 1 hour in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 900000 // 15 minutes in milliseconds
  },

  // ============================================
  // PAYMENT GATEWAYS
  // ============================================
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

  // ============================================
  // EMAIL SERVICE CONFIGURATION
  // ============================================
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

  // ============================================
  // FILE UPLOAD CONFIGURATION
  // ============================================
  upload: {
    maxFileSize: 5242880, // 5MB in bytes
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: './uploads',
    menuImagesPath: './uploads/menu',
    profileImagesPath: './uploads/profiles'
  },

  // ============================================
  // EXTERNAL SERVICE INTEGRATIONS
  // ============================================
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

  // ============================================
  // CACHE & PERFORMANCE
  // ============================================
  cache: {
    enabled: false,
    ttl: 300, // 5 minutes
    maxItems: 1000
  },

  // ============================================
  // MONITORING & LOGGING
  // ============================================
  monitoring: {
    enabled: false,
    sentry: {
      dsn: 'https://cafe-x-pos-dev-sentry-dsn@sentry.io/project-id'
    }
  },

  // ============================================
  // BUSINESS RULES
  // ============================================
  business: {
    minimumOrderValue: 50,
    freeDeliveryThreshold: 300,
    serviceChargePercentage: 5,
    gstPercentage: 18,
    maxDiscountPercentage: 50,
    loyaltyPointsPerRupee: 1,
    reservationAdvanceHours: 2,
    tableTurnoverTime: 45 // minutes
  },

  // ============================================
  // FEATURE FLAGS
  // ============================================
  features: {
    onlineOrdering: true,
    loyaltyProgram: true,
    reservations: true,
    analytics: true,
    multiLanguage: false,
    darkMode: true,
    notifications: true,
    integrations: false
  }
};

// extra details

//  Recommended Installation:
// Install Java JDK 17 (download from oracle.com or adoptium.net)
// Install MySQL Server (mysql.com/downloads/mysql/)
// Use MySQL Workbench to create your cafe_x_pos database
// Start Spring Boot development

// C:\Program Files\Java\jdk-17\

// https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html

// https://dev.mysql.com/downloads/mysql/

// Mysql Server - Set root password: CafeX_POS_2024! (or your choice)   

// ------------------------------------------

// backend/
// ├── pom.xml                           ✅ Enterprise dependencies
// ├── src/main/java/com/cafex/pos/
// │   ├── CafeXPosBackendApplication.java ✅ Main application
// │   ├── config/
// │   │   ├── CorsConfig.java          ✅ CORS configuration
// │   │   ├── SecurityConfig.java      ✅ Spring Security
// │   │   └── JwtAuthenticationFilter.java ✅ JWT filter
// │   ├── controller/
// │   │   └── AuthController.java      ✅ Authentication API
// │   ├── entity/
// │   │   └── User.java               ✅ User JPA entity
// │   ├── repository/
// │   │   └── UserRepository.java     ✅ Data access layer
// │   ├── service/
// │   │   └── AuthService.java        ✅ Business logic
// │   └── dto/
// │       ├── LoginRequest.java       ✅ Request DTO
// │       └── LoginResponse.java      ✅ Response DTO
// ├── src/main/resources/
// │   ├── application.properties       ✅ Database & app config
// │   └── data.sql                    ✅ Initial test data
// └── README.md                       ✅ Complete documentation 