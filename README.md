backend/
├── auth-service/               # Handles authentication (JWT, login/signup)
│   ├── package.json
│   ├── server.js               # Service entry point
│   ├── routes/
│   │   └── authRoutes.js       # API route definitions
│   ├── controllers/
│   │   └── authController.js   # Business logic
│   ├── models/
│   │   └── User.js             # User schema/model
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT validation
│   └── utils/
│       └── tokenUtils.js       # Token generation & helpers
│
├── user-service/               # Manages user profiles & social graph
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── controllers/
│   │   └── userController.js
│   ├── models/
│   │   └── UserProfile.js
│   └── utils/
│       └── helpers.js
│
├── post-service/               # Handles posts, likes, comments
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   └── postRoutes.js
│   ├── controllers/
│   │   └── postController.js
│   ├── models/
│   │   └── Post.js
│   └── utils/
│       └── helpers.js
│
├── media-service/              # Handles media upload & retrieval
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   └── mediaRoutes.js
│   ├── controllers/
│   │   └── mediaController.js
│   ├── models/
│   │   └── Media.js
│   └── utils/
│       └── storageUtils.js
│
└── shared/                     # Shared modules across services
    ├── config/
    │   └── db.js               # Database connection setup
    ├── middleware/
    │   └── errorHandler.js     # Global error handling
    └── utils/
        └── logger.js           # Logging utility
