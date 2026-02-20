# Personal CRM: Tech Stack & Architecture Brainstorm

**Date:** 2026-02-19
**Status:** Decided

## What We're Building

A mobile-friendly personal CRM web app for managing relationships, interactions, and follow-ups. Key characteristics:

- **Rich relationship graph** — contacts, interactions, follow-ups, connections between people, tags, and relationship strength scoring
- **AI-powered** — summaries, suggested follow-ups, conversation prep ("You last talked to Sarah about X"), natural language search
- **Cloud-hosted** — accessible from anywhere, no offline-first requirements
- **Mobile-friendly** — PWA or responsive design, usable on phone after meetings

## Why This Approach

**Stack: Next.js + Supabase + Claude API, deployed on Vercel**

Chosen for the best balance of speed, features, and simplicity:

- **Next.js** — aligns with existing TypeScript/React expertise (from global CLAUDE.md). App Router for server components, API routes for Claude API calls.
- **Supabase** — Postgres + auth + realtime + storage in one service. Free tier is generous. Row-level security for data privacy. Realtime subscriptions for live updates.
- **Claude API** — AI features are a core requirement. Summaries, follow-up suggestions, conversation prep, natural language search over contacts.
- **Vercel** — zero-config deploys for Next.js, free tier, edge functions.
- **Relationship graph in Postgres** — model with junction tables and recursive queries rather than a separate graph DB. Simpler infrastructure, sufficient for personal-scale data. Can migrate to Neo4j later if graph complexity demands it.

## Key Decisions

1. **Next.js + Supabase + Claude API** as the core stack
2. **Vercel** for deployment
3. **PWA** approach for mobile (responsive web + install prompt, not a native app)
4. **Postgres junction tables** for relationship graph (not a graph DB)
5. **AI as core** — not bolted on later, designed into the data model from the start
6. **Cloud-hosted** with Supabase managing data, auth, and realtime

## Rejected Alternatives

- **Neon + Drizzle** — more control but more boilerplate. Supabase's built-in auth and realtime are worth the abstraction.
- **Neo4j Aura for graph** — powerful but overkill for v1. Personal CRM won't have millions of nodes. Postgres can handle this scale with proper indexing.
- **CLI-first** — user wants mobile-friendly, not terminal-first.
- **Local-first/SQLite** — user prefers cloud-hosted for accessibility.

## Open Questions

1. **Auth scope** — just the owner (single-user app) or multi-user support?
2. **Data import** — import from Google Contacts, LinkedIn, etc.?
3. **Notification channel** — email reminders for follow-ups? Push notifications?
4. **AI cost management** — caching strategies for Claude API calls to keep costs low?
