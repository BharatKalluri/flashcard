# Flashcard project plan

## Product

Flashcard is a tiny authenticated web app. A user signs up with email and password; this creates their first named flashcard. They can create and edit multiple named cards, each with its own contact fields. A saved card is encoded as a VCF 4.0 contact inside a QR code which the user displays at an event.

For example, a user can make a `Public` card without personal details and a `Private` card that includes them. A card has no access control once shown: anyone who scans its QR receives the details encoded in that card.

There is no public profile page, public card URL, event model, recipient account, QR download, stored QR image, CRM, analytics, or social graph. The QR regenerates only after a save succeeds.

## Non-negotiable database rule

**Every table Flashcard creates—including Better Auth tables—must be inside the PostgreSQL schema `flashcard`. Nothing may be created in `public` or another schema.**

- Create `flashcard` before creating tables.
- Declare every Drizzle table with `pgSchema('flashcard')`; never use bare `pgTable`.
- Configure Better Auth’s database tables explicitly in the `flashcard` schema.
- Remove the starter `public.todos` model; it is not part of the product.
- Configure Drizzle’s migration runner with `migrationsSchema: 'flashcard'` so its bookkeeping table cannot be created in the default `drizzle` schema.
- Review generated migrations before applying them.
- Verify all Flashcard-created tables have `table_schema = 'flashcard'` and none are in `public`.

## Card fields

| Field | Rules | VCF 4.0 property |
| --- | --- | --- |
| Name | Given and family fields; at least one required. Optional additional, prefix, suffix. Each component may have multiple values. | `FN`, `N` |
| Email | Signup email is prefilled, editable, removable; multiple allowed with a label. | `EMAIL` |
| Phone | Multiple allowed; accept what the user enters; each has a label. | `TEL` |
| Company | Multiple allowed. | `ORG` |
| Job title | Multiple allowed. | `TITLE` |
| Website | Multiple allowed; each has a label. | `URL` |
| LinkedIn | One optional URL. | `URL` |
| Note | One optional value, maximum 200 characters. | `NOTE` |

Labels are the limited UI set `home`, `work`, `mobile`, and `other`; do not expose every VCF type value.

## Behaviour

- The setup form appears after signup; QR remains hidden until a name has saved successfully.
- Autosave runs after the user pauses typing, shows `Saving…` and `Saved`, and refreshes the QR only after the database update succeeds.
- On a failed save, keep the previous QR visible and show an error. Never encode unsaved data.
- QR content is a UTF-8 VCF 4.0 document, not a URL. Encode and escape VCF text correctly.
- Test raw-VCF QR scanning to native contact creation on an iPhone and Android phone before declaring it done.

## User flow

1. A new user opens Flashcard and signs up with an account name, email, and password. Anyone may sign up; no email verification is required in v1. The account name satisfies Better Auth and is not a public card URL or VCF field.
2. Signup creates the user’s first card, named `Default card`, and opens its setup form. The signup email pre-populates the first email value but may be edited or removed.
3. The user enters at least a given or family name, then optionally adds contact fields. They can add multiple emails, phone numbers, and websites; LinkedIn is a single URL. Values use the limited labels `home`, `work`, `mobile`, or `other`.
4. After the user pauses typing, Flashcard autosaves. While saving, it shows `Saving…`; on success, it shows `Saved` and regenerates the QR from the saved VCF 4.0 data.
5. Until a name has saved successfully, Flashcard shows no usable QR.
6. On later login, the dashboard shows the card list first. Each card shows its owner-only name and labels for the contact fields it contains (for example, `Email · Phone · LinkedIn`), never the actual values, so the user can choose the right QR without exposing private details in the list.
7. From the card list, the user can create another named card by duplicating the selected card. The copy receives a distinct default name such as `Default card copy`, retains the source fields, and pre-fills the login email if the source omitted it. Cards do not share later edits; this lets the user intentionally make public and private versions.
8. The user may rename or delete an individual card. Deleting a card deletes its complete VCF field document. Account deletion remains deferred.
9. At an event, the user opens the chosen card and presents its QR on their screen. They do not download, print, or share a QR file.
10. A recipient scans the QR. Their phone reads the embedded VCF 4.0 contact and offers its native contact-creation flow.
11. If saving fails, Flashcard keeps the last successfully generated QR visible and reports the error; unsaved fields never change the QR.

## Flashcard-owned SQL schema

Better Auth owns and generates its authentication tables. Its generated tables
are intentionally not duplicated here; its PostgreSQL connection must use the
`flashcard` search path, so Better Auth also creates only `flashcard.*` tables.

This is the complete DDL owned by Flashcard itself:

```sql
CREATE SCHEMA IF NOT EXISTS flashcard;

-- Created by Drizzle's migration runner with migrationsSchema: 'flashcard'.
CREATE TABLE flashcard.__drizzle_migrations (
  id serial PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

CREATE TABLE flashcard.card (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  name text NOT NULL CHECK (btrim(name) <> ''),
  fields jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(fields) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
```

`card` contains the owner-only card name and a complete `fields` JSON document
for its VCF data. For example:

```json
{
  "givenName": ["Bharat"],
  "familyName": ["Kalluri"],
  "organizations": ["Flashcard", "Open Source Collective"],
  "emails": [{ "label": "work", "value": "bharat@flashcard.app" }],
  "phones": [{ "label": "mobile", "value": "+91 12345 67890" }],
  "linkedInUrl": "https://linkedin.com/in/bharat",
  "note": "Met at IndiaFOSS"
}
```

The server validates this document with Zod before saving: only the agreed
properties are permitted; name, label, repeatability, value format, and the
200-character note limit are enforced there. This removes an unnecessary
table and keeps cloning/autosave as one card update.

Generated VCF and QR data are derived from the saved card record and are never stored.

## Locked v1 boundaries

- Password reset and account deletion are deferred; individual card deletion is supported.
- Signup is open to everyone.
- The UI uses the existing Shadcn components without additional branding direction.
- Cards are unlimited.
- Native raw-VCF QR testing on an iPhone and Android phone is required before release; the exact devices will be selected later.

## Definition of done

A user can sign up, enter a name, and see an autosaved VCF 4.0 QR. A recipient scanning it on tested iOS and Android devices can create a native contact with the selected fields. All Flashcard-created tables are verified to exist only in `flashcard`.
