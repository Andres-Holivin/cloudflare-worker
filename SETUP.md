# Setup Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create D1 Database

```bash
npx wrangler d1 create production-db
```

Copy the `database_id` from the output and update it in:
- `apps/auth/wrangler.jsonc`
- `apps/product/wrangler.jsonc`
- `apps/profile/wrangler.jsonc`

## Step 3: Generate Database Migrations

```bash
cd packages/db
npx drizzle-kit generate
cd ../..
```

## Step 4: Apply Migrations (Local)

```bash
npx wrangler d1 execute production-db --local --file=packages/db/migrations/0000_initial.sql
```

## Step 5: Apply Migrations (Production)

```bash
npx wrangler d1 execute production-db --remote --file=packages/db/migrations/0000_initial.sql
```

## Step 6: Run Development Server

### Run all workers:
```bash
npm run dev
```

### Run individual worker:
```bash
cd apps/auth && npm run dev
```

```bash
cd apps/product && npm run dev
```

```bash
cd apps/profile && npm run dev
```

## Step 7: Deploy to Production

### Deploy all workers:
```bash
npm run deploy
```

### Deploy individual worker:
```bash
cd apps/auth && npm run deploy
cd apps/product && npm run deploy
cd apps/profile && npm run deploy
```

## Testing Endpoints

### Auth Worker (localhost:8787)

```bash
# Health check
curl http://localhost:8787/health

# Register
curl -X POST http://localhost:8787/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8787/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user
curl http://localhost:8787/me \
  -H "Authorization: Bearer token_here"
```

### Product Worker (localhost:8788)

```bash
# Health check
curl http://localhost:8788/health

# Get all products
curl http://localhost:8788/products

# Create product
curl -X POST http://localhost:8788/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Product 1","price":1999}'

# Get product by ID
curl http://localhost:8788/products/1
```

### Profile Worker (localhost:8789)

```bash
# Health check
curl http://localhost:8789/health

# Get profile
curl http://localhost:8789/profile

# Update profile
curl -X PUT http://localhost:8789/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","bio":"Software Engineer"}'
```
