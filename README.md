This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Prisma

### To update DB without creating a migration

npx prisma db push

### To create types from schema.prisma

npx prisma generate

!!AFTER RUNNING THIS COMMAND YOU MUST RESTART NEXT APP, DEV MODE DOESN'T CATCH THIS!!

# Postgres Docker

```bash
docker run --name postgres-container -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ozskate -p 5432:5432 -d postgres
```

```bash
psql -h localhost -U postgres -d ozskate
```