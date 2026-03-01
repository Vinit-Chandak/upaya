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
 *
 * Phase 2 tables:
 * - temples, temple_admins, puja_catalog, addresses
 * - bookings, booking_status_log, puja_videos, puja_certificates
 * - shipping_orders
 *
 * Phase 3 tables:
 * - remedy_protocols, remedy_tasks, remedy_completions
 * - streaks, karma_points
 * - transit_alerts, notifications, notification_settings
 * - pandits, pandit_sessions
 * - wallets, wallet_transactions
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
-- KUNDLI PROFILES (Phase 1)
-- Stores person identity + birth details for the profile picker.
-- Deliberately separate from kundlis (which are pure astronomical data,
-- cached by DOB+TOB+POB and potentially shared across users).
-- user_id is nullable so anonymous users can have profiles too.
-- ============================================
CREATE TABLE IF NOT EXISTS kundli_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  person_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(20) NOT NULL DEFAULT 'self',
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
  time_approximate BOOLEAN NOT NULL DEFAULT FALSE,
  place_of_birth_name VARCHAR(255) NOT NULL,
  place_of_birth_lat DECIMAL(10, 7) NOT NULL,
  place_of_birth_lng DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kundli_profiles_user_id ON kundli_profiles(user_id);

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
-- PHASE 3: REMEDY PROTOCOLS
-- ============================================
CREATE TABLE IF NOT EXISTS remedy_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 63,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_remedy_protocols_user_id ON remedy_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_remedy_protocols_status ON remedy_protocols(status);

-- ============================================
-- PHASE 3: REMEDY TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS remedy_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID NOT NULL REFERENCES remedy_protocols(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL DEFAULT '',
  type VARCHAR(30) NOT NULL DEFAULT 'mantra',
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  frequency VARCHAR(100) NOT NULL DEFAULT 'daily',
  frequency_hi VARCHAR(100) NOT NULL DEFAULT '',
  mantra_text_roman TEXT,
  mantra_text_devanagari TEXT,
  mantra_audio_url TEXT,
  target_count INTEGER NOT NULL DEFAULT 108,
  day_of_week VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_remedy_tasks_protocol_id ON remedy_tasks(protocol_id);

-- ============================================
-- PHASE 3: REMEDY COMPLETIONS
-- ============================================
CREATE TABLE IF NOT EXISTS remedy_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES remedy_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER,
  karma_points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_remedy_completions_task_id ON remedy_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_remedy_completions_user_id ON remedy_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_remedy_completions_date ON remedy_completions(user_id, completed_date);

-- ============================================
-- PHASE 3: STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES remedy_tasks(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- ============================================
-- PHASE 3: KARMA POINTS
-- ============================================
CREATE TABLE IF NOT EXISTS karma_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL,
  source_id UUID,
  description VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_karma_points_user_id ON karma_points(user_id);

-- ============================================
-- PHASE 3: TRANSIT ALERTS
-- ============================================
CREATE TABLE IF NOT EXISTS transit_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kundli_id UUID NOT NULL REFERENCES kundlis(id) ON DELETE CASCADE,
  planet VARCHAR(20) NOT NULL,
  from_house INTEGER NOT NULL,
  to_house INTEGER NOT NULL,
  transit_date DATE NOT NULL,
  end_date DATE,
  impact_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  title VARCHAR(255) NOT NULL DEFAULT '',
  title_hi VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  remedies_json JSONB NOT NULL DEFAULT '[]',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transit_alerts_user_id ON transit_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_transit_alerts_read ON transit_alerts(user_id, read);

-- ============================================
-- PHASE 3: NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255) NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  body_hi TEXT NOT NULL DEFAULT '',
  data_json JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================
-- PHASE 3: NOTIFICATION SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  remedy_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  transit_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  festival_remedies BOOLEAN NOT NULL DEFAULT TRUE,
  puja_updates BOOLEAN NOT NULL DEFAULT TRUE,
  promotional BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_time_morning TIME NOT NULL DEFAULT '06:30',
  reminder_time_evening TIME NOT NULL DEFAULT '19:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- ============================================
-- PHASE 3: PANDITS
-- ============================================
CREATE TABLE IF NOT EXISTS pandits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL DEFAULT '',
  photo_url TEXT,
  specialities JSONB NOT NULL DEFAULT '[]',
  languages JSONB NOT NULL DEFAULT '["hi"]',
  experience_years INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  total_consultations INTEGER NOT NULL DEFAULT 0,
  price_per_min_chat INTEGER NOT NULL DEFAULT 1000,
  price_per_min_call INTEGER NOT NULL DEFAULT 1500,
  availability_json JSONB NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  bio_hi TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  firebase_uid VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pandits_status ON pandits(status);

-- ============================================
-- PHASE 3: PANDIT SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS pandit_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pandit_id UUID NOT NULL REFERENCES pandits(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL DEFAULT 'chat',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  cost INTEGER NOT NULL DEFAULT 0,
  ai_brief_json JSONB,
  ai_summary_json JSONB,
  messages_json JSONB NOT NULL DEFAULT '[]',
  rating INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pandit_sessions_user_id ON pandit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pandit_sessions_pandit_id ON pandit_sessions(pandit_id);
CREATE INDEX IF NOT EXISTS idx_pandit_sessions_status ON pandit_sessions(status);

-- ============================================
-- PHASE 3: WALLETS
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- ============================================
-- PHASE 3: WALLET TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);

-- ============================================
-- PHASE 4: PRODUCTS (SIDDHA STORE)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL DEFAULT '',
  category VARCHAR(30) NOT NULL DEFAULT 'gemstones',
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL,
  mrp INTEGER NOT NULL,
  discount_pct DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  weight VARCHAR(50),
  specifications JSONB NOT NULL DEFAULT '{}',
  wearing_instructions TEXT,
  wearing_instructions_hi TEXT,
  pran_pratistha_video_url TEXT,
  certification TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  dosha_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_dosha_type ON products(dosha_type);

-- ============================================
-- PHASE 4: PRODUCT REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);

-- ============================================
-- PHASE 4: CART ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- ============================================
-- PHASE 4: PRODUCT ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS product_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL,
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);

-- ============================================
-- PHASE 4: PRODUCT ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS product_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_order_items_order_id ON product_order_items(order_id);

-- ============================================
-- PHASE 4: SEVA CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS seva_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL DEFAULT 'gau_seva',
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  description_hi TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  photo_proof BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seva_catalog_temple_id ON seva_catalog(temple_id);
CREATE INDEX IF NOT EXISTS idx_seva_catalog_type ON seva_catalog(type);

-- ============================================
-- PHASE 4: SEVA BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS seva_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seva_catalog_id UUID NOT NULL REFERENCES seva_catalog(id) ON DELETE RESTRICT,
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seva_bookings_user_id ON seva_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_seva_bookings_status ON seva_bookings(status);

-- ============================================
-- PHASE 4: SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'basic',
  protocol_id UUID REFERENCES remedy_protocols(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- PHASE 4: FAMILY MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(30) NOT NULL DEFAULT 'other',
  kundli_id UUID REFERENCES kundlis(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);

-- ============================================
-- PHASE 4: MUHURTA QUERIES
-- ============================================
CREATE TABLE IF NOT EXISTS muhurta_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  category VARCHAR(30) NOT NULL DEFAULT 'other',
  recommended_dates_json JSONB NOT NULL DEFAULT '[]',
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_muhurta_queries_user_id ON muhurta_queries(user_id);

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

  -- Phase 3 triggers
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_remedy_protocols_updated_at') THEN
    CREATE TRIGGER update_remedy_protocols_updated_at
      BEFORE UPDATE ON remedy_protocols
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_streaks_updated_at') THEN
    CREATE TRIGGER update_streaks_updated_at
      BEFORE UPDATE ON streaks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_settings_updated_at') THEN
    CREATE TRIGGER update_notification_settings_updated_at
      BEFORE UPDATE ON notification_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pandit_sessions_updated_at') THEN
    CREATE TRIGGER update_pandit_sessions_updated_at
      BEFORE UPDATE ON pandit_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wallets_updated_at') THEN
    CREATE TRIGGER update_wallets_updated_at
      BEFORE UPDATE ON wallets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Phase 4 triggers
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_orders_updated_at') THEN
    CREATE TRIGGER update_product_orders_updated_at
      BEFORE UPDATE ON product_orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
`;
