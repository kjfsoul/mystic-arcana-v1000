# Supabase Vector Extension Setup Guide

## Overview
The Mystic Arcana application requires the PostgreSQL `vector` extension for AI/ML embedding functionality. This guide explains how to set it up and troubleshoot common issues.

## Required Setup

### 1. Enable Vector Extension in Supabase Dashboard

**Production/Hosted Supabase:**
1. Go to your Supabase project dashboard
2. Navigate to `Settings` → `Database`
3. Find the "Extensions" section
4. Enable the `vector` extension

**Local Development:**
```sql
-- Run in Supabase SQL editor or psql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Tables Requiring Vector Extension

The following tables have `vector` columns and will fail without the extension:

```sql
-- Journal entries with AI embeddings
journal_entries.embedding vector(1536)

-- User preference embeddings  
user_embeddings.embedding vector(1536)

-- Interaction pattern embeddings
user_interactions.embedding vector(1536)

-- Zodiac/astrology profile embeddings
user_profile_embeddings.embedding vector(1536)
```

### 3. Functions Requiring Vector Extension

```sql
-- Function that updates user embedding data
update_user_embedding(uuid, vector) → void
```

## Troubleshooting

### Error: "extension vector does not exist"
**Cause:** Vector extension not enabled in database
**Solution:** Enable vector extension in Supabase dashboard before running migrations

### Error: "type vector does not exist"
**Cause:** Migrations ran before vector extension was enabled
**Solution:** 
1. Enable vector extension
2. Re-run migrations: `npx supabase db reset`

### Error: "cannot drop extension vector because other objects depend on it"
**Cause:** Attempting to disable extension while tables use vector columns
**Solution:** Don't disable the extension. If absolutely necessary:
1. Drop all tables with vector columns
2. Drop the update_user_embedding function
3. Then drop the extension (not recommended)

## Migration Order

**CRITICAL:** The vector extension must be enabled BEFORE running any migrations that create vector columns.

**Correct order:**
1. Enable `vector` extension in Supabase dashboard
2. Run `npx supabase db reset` or migrate normally

**Wrong order (will fail):**
1. Run migrations
2. Try to enable vector extension

## Development Workflow

### Local Setup
```bash
# 1. Start local Supabase
npm run supabase:start

# 2. Enable vector extension
npx supabase db reset

# 3. Verify extension is loaded
# Check that migrations complete without vector-related errors
```

### Production Deployment
1. Ensure vector extension is enabled in production Supabase
2. Deploy application
3. Migrations will run automatically with vector support

## Vector Usage in Application

The vector columns are used for:
- **User Personalization**: Storing user preference embeddings for personalized recommendations
- **Journal Analysis**: AI analysis of user journal entries
- **Interaction Patterns**: Learning from user behavior patterns
- **Astrological Matching**: Zodiac compatibility and personality insights

## Performance Notes

- Vector columns use pgvector for efficient similarity search
- Indexes are automatically created for vector columns
- Embedding dimension is standardized at 1536 (OpenAI ada-002 format)

## Support

If you encounter vector extension issues:
1. Check Supabase dashboard extensions are enabled
2. Verify migration order (extension first, then tables)
3. Review error logs for specific vector-related messages
4. Consider recreating database if migrations are corrupted