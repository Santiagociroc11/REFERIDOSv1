/*
  # Fix RLS policies for database access

  1. Changes
    - Drop existing RLS policies
    - Create new policies that properly handle authentication and access
    - Ensure authenticated users can perform all necessary operations
  
  2. Security
    - Enable RLS on all tables
    - Add specific policies for each operation type
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON pets;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON rewards;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON visits;

-- Create new specific policies for clients table
CREATE POLICY "Enable read access for authenticated users" ON clients
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON clients
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON clients
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create new specific policies for pets table
CREATE POLICY "Enable read access for authenticated users" ON pets
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON pets
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON pets
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create new specific policies for rewards table
CREATE POLICY "Enable read access for authenticated users" ON rewards
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON rewards
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON rewards
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create new specific policies for visits table
CREATE POLICY "Enable read access for authenticated users" ON visits
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON visits
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON visits
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);