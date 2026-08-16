import os

# Base path
BASE = r"C:\Users\karim\Documents\BEST APP"

# Create migrations folder
migrations_dir = os.path.join(BASE, "migrations")
os.makedirs(migrations_dir, exist_ok=True)

# MIGRATION 1 — mark_word_migration.sql
with open(os.path.join(migrations_dir, "mark_word_migration.sql"), 'w') as f:
    f.write("""-- T001-F2: Persist the Mark word + snapshot.
-- Run this in the Supabase SQL editor.

ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS word text;
ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS snapshot_url text;
""")
print("Saved: mark_word_migration.sql")

# MIGRATION 2 — fireflag_migration.sql
with open(os.path.join(migrations_dir, "fireflag_migration.sql"), 'w') as f:
    f.write("""-- T001-F3: Fireflag lifetime bug — track only active fireflags.
-- Run this in the Supabase SQL editor.

ALTER TABLE fireflags ADD COLUMN IF NOT EXISTS is_active boolean default true;
""")
print("Saved: fireflag_migration.sql")

# MIGRATION 3 — scoring_fix_migration.sql
with open(os.path.join(migrations_dir, "scoring_fix_migration.sql"), 'w') as f:
    f.write("""-- T001-F5: Real scoring data — store the assigner's country on color assignments.
-- Run this in the Supabase SQL editor.

ALTER TABLE color_assignments ADD COLUMN IF NOT EXISTS country_code text;
""")
print("Saved: scoring_fix_migration.sql")

print(f"\nAll migration files saved to: {migrations_dir}")
print("\nNEXT STEPS:")
print("1. Run each SQL file in Supabase SQL Editor")
print("2. Update main.py /color/assign endpoint manually")
print("3. Update ranking/scorer.py with _get_assignment_stats function")
print("4. git add . && git commit -m 'T001-F2,F3,F4,F5 — Gap report fixes' && git push")
