-- Historical migration id preserved to match already-applied remote record.
-- Keep this file for migration history consistency.
DO $$
BEGIN
  ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'performed';
EXCEPTION
  WHEN undefined_object THEN
    -- If your DB doesn't use enum request_status, skip.
    NULL;
END $$;
-- Add new request status values used by karaoke flow
DO $$
BEGIN
  ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'performed';
EXCEPTION
  WHEN undefined_object THEN
    -- If your DB doesn't use enum request_status, skip.
    NULL;
END $$;