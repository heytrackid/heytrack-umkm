-- Query to check inactive recipes
SELECT id, name, is_active, created_by
FROM recipes
WHERE is_active IS NULL OR is_active = false;

-- Query to fix inactive recipes (replace 'your-user-id' with actual user ID)
UPDATE recipes
SET is_active = true
WHERE (is_active IS NULL OR is_active = false)
  AND created_by = 'your-user-id';