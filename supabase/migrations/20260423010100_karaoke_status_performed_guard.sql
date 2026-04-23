-- Correctly timestamped guard migration to ensure performed exists for enum-based schemas.
DO $$
BEGIN
  ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'performed';
EXCEPTION
  WHEN undefined_object THEN
    -- requests.status is check-constrained text in some environments; no enum to alter.
    NULL;
END $$;
