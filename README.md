# Flashcard

Flashcard is a small authenticated web app for sharing contact details at an event. Users create one or more private, named cards; each saved card becomes a VCF 4.0 contact encoded directly in an on-screen QR code. Scanning the code opens the recipient's native contact-creation flow.

Cards can intentionally contain different details, such as a public card without personal information and a private card with it. Showing a QR code shares every detail on that card.

## What it does

- Sign up with an account name, email, and password; the first `Default card` is created automatically.
- Create, duplicate, rename, edit, and delete named cards.
- Add contact details: name, email, phone, company, job title, website, LinkedIn URL, and a short note.
- Autosave edits and regenerate the QR only after a successful save.
- Keep the previous QR visible when a save fails; unsaved details are never encoded.

There are no public profiles or card URLs, QR downloads, recipient accounts, analytics, CRM, or social features.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with a PostgreSQL connection and Better Auth secret:

   ```env
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=replace-with-at-least-32-characters
   BETTER_AUTH_URL=http://localhost:3000
   ```

   Generate a secret with:

   ```bash
   npx -y @better-auth/cli secret
   ```

3. Create the database tables, then start the app:

   ```bash
   npm run db:setup
   npm run dev
   ```

The app runs at `http://localhost:3000`.

## Database rule

All application and Better Auth tables must live in the PostgreSQL `flashcard` schema—never `public`. The migration setup and schema definitions enforce this. After migrating, verify it with:

```bash
npm run db:verify
```

## Useful commands

```bash
npm run check       # format, lint, and static checks
npm run build       # production build
npm run test:card   # VCF/card serialization self-check
npm run db:generate # generate a Drizzle migration
npm run db:migrate  # apply Drizzle migrations
```

## Release check

Before release, scan saved raw-VCF QR codes on both iPhone and Android devices and confirm that the native contact apps create contacts with the selected fields.
