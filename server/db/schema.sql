-- =============================================================
-- Legacy schema from the original starter project.
-- Rxplain does not use PostgreSQL, load this file, or call db/setup.js.
-- Do not apply this schema for the Rxplain MVP.
-- =============================================================

-- Community resources the agent can search (food, health, youth programs...)
CREATE TABLE IF NOT EXISTS resources (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL DEFAULT '',
  address      TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  website      TEXT NOT NULL DEFAULT '',
  hours        TEXT NOT NULL DEFAULT '',
  languages    TEXT NOT NULL DEFAULT 'English',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A privacy-friendly log: which skill answered, never what the person typed.
CREATE TABLE IF NOT EXISTS chat_logs (
  id         SERIAL PRIMARY KEY,
  skill      TEXT NOT NULL,
  routed_by  TEXT NOT NULL,
  flags      TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resources_category_idx ON resources (category);
