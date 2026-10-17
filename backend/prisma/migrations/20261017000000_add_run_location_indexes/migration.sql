CREATE INDEX IF NOT EXISTS "runs_user_id_start_time_idx"
  ON "runs" ("user_id", "start_time");

CREATE INDEX IF NOT EXISTS "runs_user_id_end_time_idx"
  ON "runs" ("user_id", "end_time");

CREATE INDEX IF NOT EXISTS "user_locations_run_id_timestamp_idx"
  ON "user_locations" ("run_id", "timestamp");

CREATE INDEX IF NOT EXISTS "user_locations_user_id_timestamp_idx"
  ON "user_locations" ("user_id", "timestamp");
