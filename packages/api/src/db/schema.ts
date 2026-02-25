/**
 * Upaya PostgreSQL Schema v1
 *
 * Core tables for Phase 1:
 * - users
 * - kundlis
 * - chat_sessions
 * - chat_messages
 * - diagnoses
 * - reports
 * - payments
 * - referrals
 */
export const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  language VARCHAR(5) NOT NULL DEFAULT 'hi',
  firebase_uid VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ============================================
-- KUNDLIS
-- ============================================
CREATE TABLE IF NOT EXISTS kundlis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
  time_approximate BOOLEAN DEFAULT FALSE,
  place_of_birth_name VARCHAR(255) NOT NULL,
  place_of_birth_lat DECIMAL(10, 7) NOT NULL,
  place_of_birth_lng DECIMAL(10, 7) NOT NULL,
  planetary_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kundlis_user_id ON kundlis(user_id);
CREATE INDEX IF NOT EXISTS idx_kundlis_dob_place ON kundlis(date_of_birth, place_of_birth_lat, place_of_birth_lng);

-- ============================================
-- CHAT SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  problem_type VARCHAR(50),
  language VARCHAR(5) NOT NULL DEFAULT 'hi',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(30) NOT NULL DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(session_id, created_at);

-- ============================================
-- DIAGNOSES
-- ============================================
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kundli_id UUID NOT NULL REFERENCES kundlis(id) ON DELETE CASCADE,
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  problem_type VARCHAR(50),
  root_dosha VARCHAR(50),
  severity VARCHAR(20),
  impacted_areas JSONB,
  dasha_analysis JSONB,
  free_remedies JSONB NOT NULL DEFAULT '[]',
  full_remedies JSONB,
  result JSONB NOT NULL,
  llm_provider VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_kundli_id ON diagnoses(kundli_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_chat_session_id ON diagnoses(chat_session_id);

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_id UUID NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'full_remedy_plan',
  status VARCHAR(20) NOT NULL DEFAULT 'generating',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'created',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- ============================================
-- REFERRALS
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  conversion_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  credit_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);

-- ============================================
-- PHASE 2: TEMPLES
-- ============================================
CREATE TABLE IF NOT EXISTS temples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]',
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  revenue_share_pct DECIMAL(5, 2) NOT NULL DEFAULT 30.00,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  total_pujas_completed INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temples_city ON temples(city);
CREATE INDEX IF NOT EXISTS idx_temples_status ON temples(status);

-- ============================================
-- PHASE 2: TEMPLE ADMINS
-- ============================================
CREATE TABLE IF NOT EXISTS temple_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  firebase_uid VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temple_admins_temple_id ON temple_admins(temple_id);
CREATE INDEX IF NOT EXISTS idx_temple_admins_firebase_uid ON temple_admins(firebase_uid);

-- ============================================
-- PHASE 2: PUJA CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS puja_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  deity VARCHAR(100) NOT NULL DEFAULT '',
  deity_hi VARCHAR(100) NOT NULL DEFAULT '',
  dosha_type VARCHAR(50),
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  inclusions JSONB NOT NULL DEFAULT '[]',
  inclusions_hi JSONB NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  available_days JSONB NOT NULL DEFAULT '[]',
  muhurta_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puja_catalog_temple_id ON puja_catalog(temple_id);
CREATE INDEX IF NOT EXISTS idx_puja_catalog_dosha_type ON puja_catalog(dosha_type);
CREATE INDEX IF NOT EXISTS idx_puja_catalog_status ON puja_catalog(status);

-- ============================================
-- PHASE 2: ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  line1 VARCHAR(500) NOT NULL,
  line2 VARCHAR(500),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ============================================
-- PHASE 2: BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puja_catalog_id UUID NOT NULL REFERENCES puja_catalog(id) ON DELETE RESTRICT,
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE RESTRICT,
  sankalp_name VARCHAR(255) NOT NULL,
  sankalp_father_name VARCHAR(255) NOT NULL DEFAULT '',
  sankalp_gotra VARCHAR(100) NOT NULL DEFAULT '',
  sankalp_wish TEXT NOT NULL DEFAULT '',
  booking_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'booked',
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  delivery_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_temple_id ON bookings(temple_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);

-- ============================================
-- PHASE 2: BOOKING STATUS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS booking_status_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_status_log_booking_id ON booking_status_log(booking_id);

-- ============================================
-- PHASE 2: PUJA VIDEOS
-- ============================================
CREATE TABLE IF NOT EXISTS puja_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puja_videos_booking_id ON puja_videos(booking_id);

-- ============================================
-- PHASE 2: PUJA CERTIFICATES
-- ============================================
CREATE TABLE IF NOT EXISTS puja_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_puja_certificates_booking_id ON puja_certificates(booking_id);

-- ============================================
-- PHASE 2: SHIPPING ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT '',
  tracking_number VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  estimated_delivery DATE,
  delivery_address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_orders_booking_id ON shipping_orders(booking_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_sessions_updated_at') THEN
    CREATE TRIGGER update_chat_sessions_updated_at
      BEFORE UPDATE ON chat_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
    CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
    CREATE TRIGGER update_bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shipping_orders_updated_at') THEN
    CREATE TRIGGER update_shipping_orders_updated_at
      BEFORE UPDATE ON shipping_orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
`;
