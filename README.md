# Mid Backend

TypeScript backend with user registration, favorites, pagination, and caching.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` if needed
   - Database: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
   - Ensure PostgreSQL is running on port 1128

3. **Create database**
   ```bash
   # Create DB: mid_backend (if not exists)
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## Swagger Docs

Interactive API documentation is available at:

**http://localhost:3000/api-docs**

Use the "Authorize" button with your JWT token (Bearer &lt;token&gt;) to test protected endpoints.

## API

### Auth
- `POST /api/auth/register` — Register (name, email, password, phoneNumber?)
- `POST /api/auth/login` — Login (email, password)

### Items
- `GET /api/items` — List items (cursor-based pagination: `?cursor=&limit=20`)
- `GET /api/items/favorites` — Get favorites (requires Bearer token)
- `POST /api/items/:id/favorite` — Add favorite (requires Bearer token)
- `DELETE /api/items/:id/favorite` — Remove favorite (requires Bearer token)

### Reports
- `GET /api/reports/user-activity` — User activity report (requires Bearer token)

### Validation (registration)
- **Email**: valid format
- **Password**: min 8 chars, uppercase, lowercase, number, special character
- **Phone**: optional, E.164 or 10–15 digits
