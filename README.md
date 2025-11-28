# Cloudflare Workers API Monorepo

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

```bash
npm run deploy
```

## Database Setup

```bash
wrangler d1 create production-db
wrangler d1 execute production-db --local --file=./packages/db/migrations/0000_initial.sql
```
