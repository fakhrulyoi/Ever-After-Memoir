#!/usr/bin/env bash
# Local database test: plain Postgres with a Supabase stand-in.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
psql -q -d postgres -c "drop database if exists eam_test" -c "create database eam_test"
run() { psql -q -d eam_test -v ON_ERROR_STOP=1 -f "$1" 2>&1 | grep -v "does not exist, skipping" || true; }
run supabase/tests/00_supabase_stub.sql
run supabase/migrations/0001_schema.sql
run supabase/migrations/0002_seed.sql
run supabase/migrations/0003_booking.sql
run supabase/migrations/0004_refresh.sql
echo "-- re-running migrations to check they are safe to run twice"
run supabase/migrations/0001_schema.sql
run supabase/migrations/0002_seed.sql
run supabase/migrations/0003_booking.sql
run supabase/migrations/0004_refresh.sql
psql -q -d eam_test -v ON_ERROR_STOP=1 -f supabase/tests/01_security_tests.sql 2>&1 | sed 's/^psql:[^:]*:[0-9]*: //'
