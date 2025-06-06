# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and env file
COPY . .

# Build the app with environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DOMAIN
ARG VITE_DEFAULT_IMG_POST
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV \
  VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  VITE_DOMAIN=$VITE_DOMAIN \
  VITE_DEFAULT_IMG_POST=$VITE_DEFAULT_IMG_POST \
  VITE_API_URL=$VITE_API_URL \
  VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
  VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
  VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
  VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
  VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
  VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
  NODE_ENV=production

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 
