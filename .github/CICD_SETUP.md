# GitHub CI/CD Setup Guide

This guide will help you configure GitHub Actions CI/CD for your Cloudflare Workers monorepo.

## 📋 Prerequisites

- GitHub repository for this project
- Cloudflare account
- Cloudflare API Token with appropriate permissions

## 🔑 Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### For All Environments

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

1. **CLOUDFLARE_API_TOKEN**
   - Get from: Cloudflare Dashboard → My Profile → API Tokens
   - Required permissions: `Workers Scripts:Edit`, `Account Settings:Read`
   - Create token at: https://dash.cloudflare.com/profile/api-tokens

2. **CLOUDFLARE_ACCOUNT_ID**
   - Get from: Cloudflare Dashboard → Workers & Pages → Overview
   - Or from any worker URL in Cloudflare dashboard

3. **DATABASE_URL** (for migrations)
   - Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`

## 🌍 Environment Setup

### Create Environments in GitHub

1. Go to **Settings** → **Environments**
2. Create two environments:
   - `staging`
   - `production`

### Add Environment Protection Rules (Production)

For the `production` environment:
- ✅ Enable "Required reviewers" (recommended)
- ✅ Wait timer: 0 minutes (or set as needed)
- ✅ Deployment branches: Selected branches → `main`

## 📝 Wrangler Configuration

Update your `wrangler.jsonc` files to support multiple environments:

```jsonc
{
  "name": "auth-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  
  "env": {
    "staging": {
      "name": "auth-worker-staging",
      "vars": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "name": "auth-worker",
      "vars": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

Repeat this pattern for all workers in:
- `apps/auth/wrangler.jsonc`
- `apps/product/wrangler.jsonc`
- `apps/profile/wrangler.jsonc`

## 🚀 Workflows Overview

### 1. CI Workflow (`ci.yml`)
**Triggers:** Push or PR to `main` or `develop` branches

**What it does:**
- Type checks all TypeScript code
- Builds all packages and workers
- Uploads build artifacts

### 2. Deploy to Staging (`deploy-staging.yml`)
**Triggers:** Push to `develop` branch or manual dispatch

**What it does:**
- Builds all packages
- Deploys all workers to staging environment
- Uses `--env staging` flag

### 3. Deploy to Production (`deploy-production.yml`)
**Triggers:** Push to `main` branch or manual dispatch

**What it does:**
- Builds all packages
- Deploys all workers to production environment
- Creates deployment summary

### 4. Database Migrations (`db-migrations.yml`)
**Triggers:** Manual dispatch only

**What it does:**
- Runs Drizzle migrations
- Can target staging or production

## 🔄 Recommended Git Workflow

```bash
# Development
develop → staging environment

# Production
main → production environment
```

### Typical workflow:
1. Create feature branch from `develop`
2. Open PR to `develop` → CI runs
3. Merge to `develop` → Deploys to staging
4. Test in staging
5. Open PR from `develop` to `main`
6. Merge to `main` → Deploys to production

## 🧪 Testing the Setup

1. **Test CI:**
   ```bash
   git checkout -b test/ci-setup
   # Make a small change
   git push origin test/ci-setup
   # Create PR to develop
   ```

2. **Test Staging Deployment:**
   ```bash
   git checkout develop
   git merge test/ci-setup
   git push origin develop
   # Watch GitHub Actions
   ```

3. **Test Production Deployment:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # Watch GitHub Actions (with required approvals if set)
   ```

## 🔧 Running Migrations

To run database migrations:

1. Go to **Actions** tab in GitHub
2. Select **Database Migrations** workflow
3. Click **Run workflow**
4. Select environment (`staging` or `production`)
5. Click **Run workflow**

## 📊 Monitoring Deployments

- Check **Actions** tab for workflow runs
- Each deployment creates a summary with deployed workers
- Failed deployments will show error details

## ⚙️ Customization

### Adding More Workers

When adding a new worker:

1. Add deployment step in both staging and production workflows:
   ```yaml
   - name: Deploy New Worker to Production
     working-directory: apps/new-worker
     run: npx wrangler deploy
     env:
       CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
       CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
   ```

### Adding Tests

Add a test job to `ci.yml`:

```yaml
test:
  name: Run Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm test
```

## 🔒 Security Best Practices

1. ✅ Never commit secrets to the repository
2. ✅ Use environment-specific secrets when needed
3. ✅ Rotate API tokens regularly
4. ✅ Enable required reviewers for production
5. ✅ Use minimal permissions for API tokens
6. ✅ Enable branch protection rules

## 📚 Additional Resources

- [Cloudflare Workers CI/CD](https://developers.cloudflare.com/workers/ci-cd/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
