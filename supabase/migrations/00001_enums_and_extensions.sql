-- ============================================================================
-- HeyTrack Database Schema - Part 1: Enums and Extensions
-- ============================================================================
-- Compatible with Stack Auth JWT authentication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS business_unit CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS production_status CASCADE;
DROP TYPE IF EXISTS record_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'viewer');
CREATE TYPE business_unit AS ENUM ('kitchen', 'sales', 'inventory', 'finance', 'all');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER');
CREATE TYPE production_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE record_type AS ENUM ('INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL');
CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE');
