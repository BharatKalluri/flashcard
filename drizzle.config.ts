import { defineConfig } from 'drizzle-kit'
import { getDatabaseUrl } from './src/lib/env.server'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  schemaFilter: ['flashcard'],
  migrations: { schema: 'flashcard' },
  dbCredentials: {
    url: getDatabaseUrl(),
  },
})
