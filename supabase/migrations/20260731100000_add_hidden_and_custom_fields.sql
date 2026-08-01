ALTER TABLE categories
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE appointments
ADD COLUMN custom_field_responses JSONB NOT NULL DEFAULT '{}'::jsonb;
