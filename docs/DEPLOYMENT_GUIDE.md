# SkyPulse Deployment Guide

This guide details the steps to set up, run, and deploy the SkyPulse Smart Weather Dashboard in both local and production environments.

---

## 1. Local Development Setup

### Prerequisites
* Install **[Node.js (18+)](https://nodejs.org/)**
* Install **[MongoDB Community Edition](https://www.mongodb.com/try/download/community)**
* A web browser (Chrome, Firefox, Safari, Edge)

### Step-by-Step Installation
1. Extract the project files locally.
2. Open your terminal and navigate to the project directory:
   ```bash
   cd e:/3rd Semester/Projects/weather-app-main/weather-app-main
   ```
3. Install the application dependencies:
   ```bash
   npm install
   ```
4. Create your environment configuration file:
   * Copy the template file:
     ```bash
     cp .env.example .env
     ```
   * Open `.env` and verify the values:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/skypulse
     JWT_SECRET=mycustomsecretkeyforjwt2026
     JWT_EXPIRE=7d
     ```
5. Ensure your local MongoDB database is running:
   * **Windows Command**:
     ```cmd
     net start MongoDB
     ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open your browser and go to **[http://localhost:5000](http://localhost:5000)**.

---

## 2. MongoDB Atlas (Cloud) Configuration

For production deployments, you should use MongoDB Atlas (a free, managed cloud database service) instead of a local instance.

### Setup Instructions
1. Register for a free account at **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.
2. Create a new Shared Cluster (free tier).
3. Set up database access:
   * Create a database user (note the username and password).
4. Configure network access:
   * Add IP address `0.0.0.0/0` to allow connections from any hosting provider.
5. Get your connection string:
   * Click **Connect** → **Connect your application**.
   * Copy the connection string. It should look like this:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/skypulse?retryWrites=true&w=majority
     ```
6. Replace `MONGODB_URI` in your `.env` file with this connection string (remember to fill in your database user's password).

---

## 3. Production Deployment (Render.com)

Render.com is a straightforward cloud hosting platform that supports Node.js web services for free.

### Step-by-Step Deployment
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SkyPulse"
   ```
2. Create a new repository on **GitHub** and push your files.
3. Sign in to **[Render.com](https://render.com/)** and click **New** → **Web Service**.
4. Connect your GitHub account and select the SkyPulse repository.
5. Configure the Web Service settings:
   * **Name**: `skypulse-weather-dashboard`
   * **Environment**: `Node`
   * **Region**: Select a region close to your target audience.
   * **Branch**: `main`
   * **Build Command**: `npm install`
   * **Start Command**: `node server/server.js`
6. Click **Advanced** to add environment variables matching your `.env` configuration:
   * `PORT`: `5000`
   * `MONGODB_URI`: *Your MongoDB Atlas connection string*
   * `JWT_SECRET`: *A secure random string*
   * `JWT_EXPIRE`: `7d`
7. Click **Create Web Service**. Once the build succeeds, Render will generate a public URL for your application (e.g., `https://skypulse.onrender.com`).

---

## 4. Troubleshooting Guide

### Port is Already in Use
* **Issue**: The server crashes on startup with `EADDRINUSE: address already in use :::5000`.
* **Fix**: Another service is running on port 5000. You can stop that service or open `.env` and change `PORT` to another value, such as `8080`.

### Database Connection Failed
* **Issue**: The console logs `MongoDB Connection Error`.
* **Fix**: Ensure your local MongoDB database service is running (`net start MongoDB` on Windows). If you are using MongoDB Atlas, make sure you whitelisted access from all IPs (`0.0.0.0/0`) in the Atlas console.

### Profile Avatars Don't Render
* **Issue**: Uploaded avatars result in broken image icons.
* **Fix**: Check that the `uploads` directory exists. SkyPulse handles this automatically using a `.gitkeep` file in the `/uploads/` folder.
