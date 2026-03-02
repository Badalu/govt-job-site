-- ============================================
-- SARKARI NAUKRI BLOG - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CATEGORIES TABLE
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  seo_title VARCHAR(200),
  seo_description VARCHAR(300),
  icon VARCHAR(10),
  color VARCHAR(20) DEFAULT '#f97316',
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STATES TABLE
CREATE TABLE states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  seo_title VARCHAR(200),
  seo_description VARCHAR(300),
  capital VARCHAR(100),
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAGS TABLE
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  seo_title VARCHAR(200),
  seo_description VARCHAR(300),
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POSTS TABLE (main jobs table)
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  featured_image_alt VARCHAR(300),

  -- SEO Fields
  seo_title VARCHAR(200),
  seo_description VARCHAR(300),
  canonical_url VARCHAR(500),
  og_image VARCHAR(500),

  -- Job Details
  organization VARCHAR(200),
  total_posts INT,
  application_start DATE,
  application_end DATE,
  exam_date DATE,
  salary_min INT,
  salary_max INT,
  salary_text VARCHAR(200),
  qualification VARCHAR(500),
  age_min INT,
  age_max INT,
  official_website VARCHAR(300),
  apply_link VARCHAR(500),
  notification_link VARCHAR(500),
  admit_card_link VARCHAR(500),
  result_link VARCHAR(500),

  -- Relations
  category_id UUID REFERENCES categories(id),
  state_id UUID REFERENCES states(id),

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  post_type VARCHAR(30) DEFAULT 'job' CHECK (post_type IN ('job', 'result', 'admit-card', 'answer-key', 'syllabus', 'news')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,

  -- Dates
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POST TAGS (many-to-many)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- FAQ TABLE
CREATE TABLE faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT DATES TABLE (for job notifications)
CREATE TABLE important_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  label VARCHAR(200) NOT NULL,
  date_value VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0
);

-- APPLICATION FEE TABLE
CREATE TABLE application_fees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0
);

-- VACANCY DETAILS TABLE
CREATE TABLE vacancy_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  post_name VARCHAR(200) NOT NULL,
  total_posts INT,
  gen INT,
  obc INT,
  sc INT,
  st INT,
  ews INT,
  qualification VARCHAR(300),
  sort_order INT DEFAULT 0
);

-- SITE SETTINGS
CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_state ON posts(state_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_featured ON posts(is_featured);
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
CREATE INDEX idx_faqs_post ON faqs(post_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER states_updated_at BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO categories (name, slug, description, seo_title, icon, color) VALUES
('Railway Jobs', 'railway', 'Latest Railway Recruitment Notifications 2026', 'Railway Jobs 2026 - Sarkari Naukri | Apply Online', '🚂', '#3b82f6'),
('Banking Jobs', 'banking', 'Bank PO, Clerk, SO Recruitment 2026', 'Banking Jobs 2026 - Bank PO Clerk SO | Sarkari Naukri', '🏦', '#10b981'),
('Police Jobs', 'police', 'Police Constable, SI, Inspector Recruitment 2026', 'Police Jobs 2026 - Constable SI Inspector | Apply Online', '👮', '#6366f1'),
('Teaching Jobs', 'teaching', 'Teacher, TGT, PGT, Lecturer Recruitment 2026', 'Teaching Jobs 2026 - TGT PGT Lecturer | Sarkari Naukri', '📚', '#f59e0b'),
('Defense Jobs', 'defense', 'Army, Navy, Air Force, CRPF Recruitment 2026', 'Defense Jobs 2026 - Army Navy Air Force | Apply Online', '🎖️', '#ef4444'),
('SSC Jobs', 'ssc', 'SSC CGL, CHSL, MTS, CPO Recruitment 2026', 'SSC Jobs 2026 - CGL CHSL MTS CPO | Sarkari Naukri', '📋', '#8b5cf6'),
('UPSC Jobs', 'upsc', 'IAS, IPS, IFS Civil Services Recruitment 2026', 'UPSC Jobs 2026 - IAS IPS Civil Services | Apply Online', '🏛️', '#ec4899'),
('State PSC', 'state-psc', 'State Public Service Commission Recruitment 2026', 'State PSC Jobs 2026 - PSC Recruitment | Sarkari Naukri', '🏢', '#14b8a6');

INSERT INTO states (name, slug, description, seo_title, capital) VALUES
('Uttar Pradesh', 'uttar-pradesh', 'UP Govt Jobs 2026 - Latest Sarkari Naukri in Uttar Pradesh', 'UP Govt Jobs 2026 - Sarkari Naukri Uttar Pradesh', 'Lucknow'),
('Haryana', 'haryana', 'Haryana Govt Jobs 2026 - Latest Sarkari Naukri in Haryana', 'Haryana Govt Jobs 2026 - Sarkari Naukri Haryana', 'Chandigarh'),
('Rajasthan', 'rajasthan', 'Rajasthan Govt Jobs 2026 - Latest Sarkari Naukri in Rajasthan', 'Rajasthan Govt Jobs 2026 - Sarkari Naukri Rajasthan', 'Jaipur'),
('Bihar', 'bihar', 'Bihar Govt Jobs 2026 - Latest Sarkari Naukri in Bihar', 'Bihar Govt Jobs 2026 - Sarkari Naukri Bihar', 'Patna'),
('Madhya Pradesh', 'madhya-pradesh', 'MP Govt Jobs 2026 - Latest Sarkari Naukri in MP', 'MP Govt Jobs 2026 - Sarkari Naukri Madhya Pradesh', 'Bhopal'),
('Maharashtra', 'maharashtra', 'Maharashtra Govt Jobs 2026 - Latest Sarkari Naukri', 'Maharashtra Govt Jobs 2026 - Sarkari Naukri Maharashtra', 'Mumbai'),
('Gujarat', 'gujarat', 'Gujarat Govt Jobs 2026 - Latest Sarkari Naukri in Gujarat', 'Gujarat Govt Jobs 2026 - Sarkari Naukri Gujarat', 'Gandhinagar'),
('Punjab', 'punjab', 'Punjab Govt Jobs 2026 - Latest Sarkari Naukri in Punjab', 'Punjab Govt Jobs 2026 - Sarkari Naukri Punjab', 'Chandigarh');

INSERT INTO tags (name, slug, description) VALUES
('SSC', 'ssc', 'Staff Selection Commission Jobs'),
('UPSC', 'upsc', 'Union Public Service Commission Jobs'),
('Railway', 'railway', 'Indian Railway Recruitment'),
('Bank PO', 'bank-po', 'Bank Probationary Officer Jobs'),
('Police', 'police', 'Police Department Recruitment'),
('Army', 'army', 'Indian Army Recruitment'),
('10th Pass', '10th-pass', 'Jobs for 10th Pass Candidates'),
('12th Pass', '12th-pass', 'Jobs for 12th Pass Candidates'),
('Graduate', 'graduate', 'Graduation Required Jobs'),
('Engineering', 'engineering', 'Engineering Graduate Jobs');

INSERT INTO site_settings (key, value) VALUES
('site_name', 'SarkariNaukri.com'),
('site_tagline', 'Latest Govt Jobs 2026 | Sarkari Result | Apply Online'),
('site_url', 'https://sarkarinaukri.com'),
('site_description', 'Get latest Sarkari Naukri 2026, Government Jobs, Sarkari Result, Admit Card, Answer Key. Check latest recruitment notifications for SSC, Railway, Banking, Police, UPSC jobs.'),
('site_keywords', 'sarkari naukri, govt jobs, sarkari result, government jobs 2026, sarkari job'),
('contact_email', 'contact@sarkarinaukri.com'),
('facebook_url', ''),
('twitter_url', ''),
('telegram_url', ''),
('youtube_url', ''),
('adsense_id', ''),
('google_analytics_id', ''),
('google_tag_manager_id', '');
