CREATE SCHEMA IF NOT EXISTS "flashcard";

CREATE TABLE "flashcard"."card" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "flashcard"."card_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "card_user_name_unique" UNIQUE("user_id","name"),
	CONSTRAINT "card_name_not_blank" CHECK (btrim("flashcard"."card"."name") <> ''),
	CONSTRAINT "card_fields_object" CHECK (jsonb_typeof("flashcard"."card"."fields") = 'object')
);
