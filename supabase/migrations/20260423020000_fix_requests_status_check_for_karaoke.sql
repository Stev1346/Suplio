-- 1) Drop old status check if it exists
ALTER TABLE public.requests
DROP CONSTRAINT IF EXISTS requests_status_check;

-- 2) Recreate with full allowed statuses (song + karaoke)
ALTER TABLE public.requests
ADD CONSTRAINT requests_status_check
CHECK (
  status IN (
    'pending',
    'accepted',
    'rejected',
    'played',
    'queued',
    'up_next',
    'performing_now',
    'performed'
  )
);