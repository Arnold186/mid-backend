# Database Setup Guide

## Problem
The database `mid_backend` doesn't exist yet, and we need to create it.

## Solution Options

### Option 1: Automatic Setup (Recommended)
1. **Test your connection first:**
   ```bash
   npm run db:test
   ```
   This will verify your PostgreSQL credentials are correct.

2. **Create the database:**
   ```bash
   npm run db:setup
   ```

3. **Run Prisma migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Seed the database (optional):**
   ```bash
   npm run prisma:seed
   ```

### Option 2: Manual Setup using psql

1. **Open PowerShell or Command Prompt**

2. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```
   (Enter your PostgreSQL password when prompted)

3. **Create the database:**
   ```sql
   CREATE DATABASE mid_backend;
   ```

4. **Exit psql:**
   ```sql
   \q
   ```

5. **Run Prisma migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

### Option 3: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it: `mid_backend`
5. Click "Save"
6. Run Prisma migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Troubleshooting

### Authentication Failed
If you get "password authentication failed":
1. Check your `.env` file - make sure `DB_PASSWORD` is correct
2. The password `Umuhire@123` needs to match your PostgreSQL password
3. If you forgot your PostgreSQL password, you may need to reset it

### Connection Refused
If you get "connection refused":
1. Make sure PostgreSQL service is running
2. Check if PostgreSQL is listening on port 5432
3. Verify firewall settings allow connections

### Database Already Exists
If the database already exists, that's fine! Just run:
```bash
npm run prisma:migrate
```

## Current Configuration
- **Database Name:** `mid_backend`
- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** Check your `.env` file

## After Setup
Once the database is created and migrations are run, start your server:
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:1080
```
