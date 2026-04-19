-- Phase 0.5: enforce one active vote per request per voter
-- Safe to run multiple times.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'votes_request_id_voter_id_key'
  ) THEN
    ALTER TABLE public.votes
      ADD CONSTRAINT votes_request_id_voter_id_key
      UNIQUE (request_id, voter_id);
  END IF;
END $$;
