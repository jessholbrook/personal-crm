import type { Database } from "./database";

type Tables = Database["public"]["Tables"];

// Contacts
export type Contact = Tables["contacts"]["Row"];
export type ContactInsert = Tables["contacts"]["Insert"];
export type ContactUpdate = Tables["contacts"]["Update"];

// Interactions
export type Interaction = Tables["interactions"]["Row"];
export type InteractionInsert = Tables["interactions"]["Insert"];
export type InteractionUpdate = Tables["interactions"]["Update"];

// Interaction-Contact junction
export type InteractionContact = Tables["interaction_contacts"]["Row"];
export type InteractionContactInsert = Tables["interaction_contacts"]["Insert"];

// Follow-ups
export type FollowUp = Tables["follow_ups"]["Row"];
export type FollowUpInsert = Tables["follow_ups"]["Insert"];
export type FollowUpUpdate = Tables["follow_ups"]["Update"];

// Tags
export type Tag = Tables["tags"]["Row"];
export type TagInsert = Tables["tags"]["Insert"];

// Contact-Tag junction
export type ContactTag = Tables["contact_tags"]["Row"];
export type ContactTagInsert = Tables["contact_tags"]["Insert"];
