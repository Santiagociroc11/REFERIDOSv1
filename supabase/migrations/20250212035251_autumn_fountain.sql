/*
  # Fix RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper authentication checks
    - Add specific policies for each operation type
    - Ensure proper access control for authenticated users

  2. Security
    - Enforce authentication for all operations
    - Allow authenticated users to perform CRUD operations
    - Maintain data integrity with proper checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON pets;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON pets;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON pets;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON rewards;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON rewards;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON rewards;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON visits;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON visits;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON visits;

-- Create policies for clients table
CREATE POLICY "Enable read for authenticated users" ON clients
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON clients
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON clients
    FOR UPDATE TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for pets table
CREATE POLICY "Enable read for authenticated users" ON pets
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON pets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON pets
    FOR UPDATE TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for rewards table
CREATE POLICY "Enable read for authenticated users" ON rewards
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON rewards
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON rewards
    FOR UPDATE TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for visits table
CREATE POLICY "Enable read for authenticated users" ON visits
    FOR SELECT TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON visits
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON visits
    FOR UPDATE TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);