/*
  # Initial Schema for Veterinary Referral System

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text, optional)
      - `registration_date` (timestamptz)
      - `referrer_id` (uuid, foreign key to clients)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `pets`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `name` (text)
      - `species` (text)
      - `breed` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `rewards`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `type` (text, enum: 'DIRECT', 'SECOND_LEVEL')
      - `status` (text, enum: 'PENDING', 'CLAIMED')
      - `date_earned` (timestamptz)
      - `date_claimed` (timestamptz, optional)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `visits`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `pet_id` (uuid, foreign key to pets)
      - `visit_date` (timestamptz)
      - `reason` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage all data
*/

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    registration_date timestamptz NOT NULL DEFAULT now(),
    referrer_id uuid REFERENCES clients(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name text NOT NULL,
    species text NOT NULL,
    breed text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('DIRECT', 'SECOND_LEVEL')),
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED')),
    date_earned timestamptz NOT NULL DEFAULT now(),
    date_claimed timestamptz,
    description text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_rewards_updated_at
    BEFORE UPDATE ON rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    visit_date timestamptz NOT NULL DEFAULT now(),
    reason text NOT NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users" ON clients
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON pets
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON rewards
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON visits
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_referrer_id ON clients(referrer_id);
CREATE INDEX IF NOT EXISTS idx_pets_client_id ON pets(client_id);
CREATE INDEX IF NOT EXISTS idx_rewards_client_id ON rewards(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_client_id ON visits(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_pet_id ON visits(pet_id);