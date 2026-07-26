# Aperture Photography Portfolio - Server

This is the Node.js/Express backend for the Aperture photography portfolio.

## Features
- JWT-based admin authentication
- Image upload and management
- MongoDB storage for image metadata
- Cloudinary integration for image hosting

## Tech Stack
- Node.js
- Express.js
- MongoDB with Mongoose
- Cloudinary
- JWT
- Multer

## Installation
```bash
npm install
```

## Run locally
```bash
npm run dev
```

## Environment Variables
Create a `.env` file in the server root and add:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Site Admin
```

## Seed admin user
```bash
npm run seed:admin
```
