-- Personal CRM schema
-- All tables, constraints, CHECK enums, composite PKs

-- Contacts
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  title text,
  notes text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Interactions
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('meeting', 'call', 'email', 'message', 'note')),
  title text,
  content text,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Interaction-Contact junction (multi-contact interactions)
CREATE TABLE interaction_contacts (
  interaction_id uuid NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (interaction_id, contact_id)
);

-- Follow-ups
CREATE TABLE follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tags
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  UNIQUE (user_id, name)
);

-- Contact-Tag junction
CREATE TABLE contact_tags (
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);
