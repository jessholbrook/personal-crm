-- RLS policies, FK ownership triggers, and indexes

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies: direct ownership check
-- CRITICAL: wrap auth.uid() in (SELECT ...) for query planner optimization

CREATE POLICY "contacts_all" ON contacts
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "interactions_all" ON interactions
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "interaction_contacts_all" ON interaction_contacts
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "follow_ups_all" ON follow_ups
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "tags_all" ON tags
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "contact_tags_all" ON contact_tags
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- FK ownership validation triggers for junction tables
-- Ensures that the referenced interaction/contact/tag belong to the same user

CREATE OR REPLACE FUNCTION validate_interaction_contact_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM interactions WHERE id = NEW.interaction_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Interaction does not belong to user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM contacts WHERE id = NEW.contact_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Contact does not belong to user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_interaction_contact
  BEFORE INSERT ON interaction_contacts
  FOR EACH ROW EXECUTE FUNCTION validate_interaction_contact_ownership();

CREATE OR REPLACE FUNCTION validate_contact_tag_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM contacts WHERE id = NEW.contact_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Contact does not belong to user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM tags WHERE id = NEW.tag_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Tag does not belong to user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_contact_tag
  BEFORE INSERT ON contact_tags
  FOR EACH ROW EXECUTE FUNCTION validate_contact_tag_ownership();

-- Indexes: user_id on all tables for RLS performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
