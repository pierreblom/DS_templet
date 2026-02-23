-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;
-- Create auth.users table (mocking Supabase auth)
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    email character varying(255) UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);
-- Create public schema tables
-- Ensure Profile matches our auth/user system
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255) NOT NULL UNIQUE,
    role character varying(50) DEFAULT 'customer',
    updated_at timestamp with time zone DEFAULT now()
);
-- 1. Clients Table (The Core)
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(50),
    vat_number character varying(50),
    address text,
    city character varying(255),
    postal_code character varying(20),
    country character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    invoice_number character varying(50) NOT NULL,
    amount numeric(15, 2) NOT NULL DEFAULT 0.00,
    status character varying(50) DEFAULT 'draft',
    -- draft, sent, paid, overdue, cancelled
    due_date date,
    currency character varying(10) DEFAULT 'USD',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 3. Invoice Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description text NOT NULL,
    quantity numeric(12, 2) DEFAULT 1,
    unit_price numeric(15, 2) DEFAULT 0.00,
    total_price numeric(15, 2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now()
);
-- 4. Quotes Table
CREATE TABLE IF NOT EXISTS public.quotes (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    quote_number character varying(50) NOT NULL,
    amount numeric(15, 2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'draft',
    -- draft, sent, accepted, rejected, expired
    expiry_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 5. Budgets (Similar to Quotes but for internal tracking)
CREATE TABLE IF NOT EXISTS public.budgets (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_name character varying(255),
    amount numeric(15, 2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'planned',
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 6. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE
    SET NULL,
        amount numeric(15, 2) NOT NULL,
        payment_method character varying(50),
        -- bank_transfer, credit_card, cash, etc.
        payment_id character varying(100),
        -- Transaction ID from Stripe/Bank
        status character varying(50) DEFAULT 'completed',
        payment_date timestamp with time zone DEFAULT now(),
        created_at timestamp with time zone DEFAULT now()
);
-- 7. Deals (Pipeline Management)
CREATE TABLE IF NOT EXISTS public.deals (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    value numeric(15, 2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'lead',
    -- lead, investigation, proposal, negotiation, won, lost
    expected_close_date date,
    probability integer DEFAULT 0,
    -- 0 to 100
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 8. Tasks (Linked to Deals or Clients)
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
    deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'todo',
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 9. Subscriptions (Recurring Billings)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    plan_name character varying(255) NOT NULL,
    amount numeric(15, 2) NOT NULL,
    status character varying(50) DEFAULT 'active',
    interval character varying(20) DEFAULT 'month',
    -- month, year
    next_payment_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);