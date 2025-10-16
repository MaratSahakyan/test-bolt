/*
  # House Owners and Documents Schema

  ## Overview
  This migration creates the necessary tables and storage setup for a property management system
  where house owners can register, upload documents about their properties and identity.

  ## New Tables
  
  ### `house_owners`
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - Owner's full name
  - `phone` (text) - Contact phone number
  - `verification_status` (text) - Verification status: 'pending', 'verified', 'rejected'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `properties`
  - `id` (uuid, primary key) - Unique property identifier
  - `owner_id` (uuid, foreign key) - Links to house_owners
  - `property_name` (text) - Property name/title
  - `address` (text) - Property address
  - `property_type` (text) - Type: 'house', 'apartment', 'commercial', 'land'
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `documents`
  - `id` (uuid, primary key) - Unique document identifier
  - `owner_id` (uuid, foreign key) - Links to house_owners
  - `property_id` (uuid, foreign key, nullable) - Links to properties (optional)
  - `document_type` (text) - Type: 'identity', 'property_deed', 'tax_document', 'certificate', 'other'
  - `file_name` (text) - Original file name
  - `file_path` (text) - Path in storage bucket
  - `file_size` (integer) - File size in bytes
  - `mime_type` (text) - File MIME type
  - `uploaded_at` (timestamptz) - Upload timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - House owners can only access their own data
  - Authenticated users can create their own house_owner profile
  - Authenticated users can only view, create, update, and delete their own properties and documents

  ## Important Notes
  1. Email verification is handled by Supabase Auth
  2. Social sign-in providers (Google, Apple) need to be configured in Supabase Dashboard
  3. Storage bucket for documents needs to be created separately
  4. All tables use soft validation with meaningful defaults
*/

-- Create house_owners table
CREATE TABLE IF NOT EXISTS house_owners (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES house_owners(id) ON DELETE CASCADE,
  property_name text NOT NULL,
  address text NOT NULL,
  property_type text DEFAULT 'house' CHECK (property_type IN ('house', 'apartment', 'commercial', 'land', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES house_owners(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('identity', 'property_deed', 'tax_document', 'certificate', 'other')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);

-- Enable Row Level Security
ALTER TABLE house_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for house_owners table
CREATE POLICY "Users can view own profile"
  ON house_owners FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON house_owners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON house_owners FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for properties table
CREATE POLICY "Owners can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can create own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for documents table
CREATE POLICY "Owners can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can upload own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_house_owners_updated_at') THEN
    CREATE TRIGGER update_house_owners_updated_at
      BEFORE UPDATE ON house_owners
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
    CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;