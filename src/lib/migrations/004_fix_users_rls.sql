-- Tighten users RLS policies

DROP POLICY IF EXISTS "Users can see all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update any profile" ON users;
DROP POLICY IF EXISTS "Service role can delete users" ON users;

CREATE POLICY "Authenticated users can see users" ON users
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT u.role FROM users u WHERE u.id = auth.uid())
  AND is_active = (SELECT u.is_active FROM users u WHERE u.id = auth.uid())
);

CREATE POLICY "Service role can insert users" ON users
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can manage users" ON users
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users admin_user
    WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users admin_user
    WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
  )
);
