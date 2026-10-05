-- =============================================================================
-- PROG2002 - Assignment 2: Charity Events Dynamic Website
-- Database name : charityevents_db
-- Description   : Stores charitable organisations, event categories and
--                 charity events to support the charity-events website.
-- How to import : 1) Open MySQL Workbench / terminal
--                 2) Run this whole file, OR  mysql -u root -p < charityevents_db.sql
-- =============================================================================

DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db;
USE charityevents_db;

-- -----------------------------------------------------------------------------
-- 1. Organisations
--    A charity organisation that runs one or more charity events.
-- -----------------------------------------------------------------------------
CREATE TABLE organisations (
    org_id          INT AUTO_INCREMENT PRIMARY KEY,
    org_name        VARCHAR(100) NOT NULL,
    org_description TEXT,
    email           VARCHAR(100),
    phone           VARCHAR(20),
    address         VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 2. Categories
--    Event categories used to classify and filter events (fun run, gala...).
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
    category_id         INT AUTO_INCREMENT PRIMARY KEY,
    category_name       VARCHAR(50) NOT NULL UNIQUE,
    category_description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 3. Events
--    The core table. Holds everything needed to display an event, including
--    ticket price, fundraising goal vs progress, date, location and status.
--    status = 'active'    -> shown on the website
--    status = 'suspended' -> hidden from the website (policy violation)
-- -----------------------------------------------------------------------------
CREATE TABLE events (
    event_id        INT AUTO_INCREMENT PRIMARY KEY,
    org_id          INT NOT NULL,
    category_id     INT NOT NULL,
    event_name      VARCHAR(150) NOT NULL,
    event_description TEXT,
    event_purpose   VARCHAR(255),
    event_date      DATE NOT NULL,
    event_time      TIME,
    location        VARCHAR(200),
    venue_address   VARCHAR(200),
    ticket_price    DECIMAL(8,2)  NOT NULL DEFAULT 0.00, -- 0.00 = free event
    goal_amount     DECIMAL(12,2) DEFAULT 0.00,
    progress_amount DECIMAL(12,2) DEFAULT 0.00,
    image_url       VARCHAR(255),
    status          ENUM('active','suspended') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_org      FOREIGN KEY (org_id)      REFERENCES organisations(org_id),
    CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(category_id),

    -- quick lookups for the search page
    INDEX idx_events_date     (event_date),
    INDEX idx_events_category (category_id),
    INDEX idx_events_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 4. Initial data
-- =============================================================================

-- Charitable organisations
INSERT INTO organisations (org_name, org_description, email, phone, address) VALUES
('Sunshine Community Foundation', 'A local non-profit dedicated to food relief, shelter and education for families in need across the city.', 'hello@sunshinefoundation.org.au', '(02) 5550 1001', '12 Harbour Street, Sydney NSW 2000'),
('Hope for Kids Australia',       'A charity focused on children\'s health, education and well-being through community events and fundraising.', 'team@hopeforkids.org.au',         '(02) 5550 2002', '88 Queen Street, Sydney NSW 2000'),
('Green Earth Volunteers',        'An environmental charity organising clean-up days, tree planting and conservation fundraisers.', 'info@greenearth.org.au',          '(02) 5550 3003', '45 King Street, Sydney NSW 2000'),
('Care for Seniors',              'A non-profit supporting elderly residents with companionship programs, meals and medical outreach.', 'care@careforseniors.org.au',      '(02) 5550 4004', '300 George Street, Sydney NSW 2000');

-- Event categories
INSERT INTO categories (category_name, category_description) VALUES
('Fun Run',        'Community running events to raise funds for a cause.'),
('Gala Dinner',    'Formal fundraising dinners with dinner, entertainment and speeches.'),
('Silent Auction', 'Events where attendees bid on donated items to raise money.'),
('Charity Concert','Live music performances with proceeds going to charity.'),
('Charity Walk',   'Leisure walking events that bring communities together for a cause.'),
('Bake Sale',      'Casual community bake sales raising funds through baked goods.'),
('Sports Tournament','Competitive sports days (football, basketball) for charity.'),
('Wellness Workshop','Educational workshops on health and well-being for fundraising.');

-- Sample events (a mix of upcoming, past and one suspended event).
-- NOTE: event_date values are relative to the current date (Oct 2026).
--       Edit these dates if you run the site later so 'upcoming' events stay upcoming.
INSERT INTO events
(event_name, org_id, category_id, event_description, event_purpose, event_date, event_time, location, venue_address, ticket_price, goal_amount, progress_amount, image_url, status) VALUES
('Sydney Harbour 5K Fun Run',      1, 1,
 'A scenic 5km run along the Sydney Harbour foreshore open to all fitness levels. Runners receive a medal and a goodie bag.',
 'Raise funds for family food-relief programs.', '2026-11-08', '08:00:00', 'Sydney Harbour Foreshore', 'Hickson Road Reserve, Sydney NSW', 25.00, 30000.00, 18500.00, 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800', 'active'),

('Annual Charity Gala Dinner',     1, 2,
 'A glamorous black-tie gala dinner with a three-course meal, live entertainment and guest speakers from the foundation.',
 'Raise funds for winter shelter programs.', '2026-12-12', '18:30:00', 'Grand Ballroom, Regent Hotel', '199 George Street, Sydney NSW', 150.00, 80000.00, 32000.00, 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800', 'active'),

('Silent Auction for Kids',        2, 3,
 'Bid on unique items and experiences donated by local businesses. All proceeds support children\'s health programs.',
 'Fund children\'s hospital equipment.', '2026-11-21', '17:00:00', 'City Convention Centre', '14 Darling Drive, Sydney NSW', 10.00, 20000.00, 9500.00, 'https://images.unsplash.com/photo-1515825838458-f2a94b20105a?w=800', 'active'),

('Green Earth Charity Concert',    3, 4,
 'An evening of live acoustic and indie music under the stars in Centennial Park. BYO picnic blanket.',
 'Fund urban tree-planting and park restoration.', '2026-10-25', '19:00:00', 'Centennial Park', 'Oxford Street, Sydney NSW', 0.00, 15000.00, 7200.00, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'active'),

('Coastal Charity Walk',           1, 5,
 'A relaxed 4km coastal walk from Bondi to Bronte, followed by a community BBQ. Pets welcome.',
 'Support coastal care and family relief services.', '2026-11-29', '09:00:00', 'Bondi to Bronte Coastal Walk', 'Bondi Beach, Sydney NSW', 15.00, 12000.00, 4800.00, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'active'),

('Community Bake Sale Day',        3, 6,
 'Homemade cakes, cookies and coffee at the Green Earth community centre. All donations go to the cause.',
 'Raise funds for community gardens.', '2026-10-18', '10:00:00', 'Green Earth Community Centre', '45 King Street, Sydney NSW', 0.00, 3000.00, 1250.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', 'active'),

('Charity Football Tournament',    2, 7,
 'A friendly five-a-side football tournament for local teams, with trophies for the winners and prizes for best costume.',
 'Fund after-school sports for disadvantaged kids.', '2026-11-14', '12:00:00', 'Macquarie Park Sports Fields', 'Macquarie Park, Sydney NSW', 20.00, 10000.00, 6100.00, 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800', 'active'),

('Mindfulness & Wellness Workshop',4, 8,
 'A half-day workshop on stress management, mindfulness and healthy living led by certified instructors.',
 'Fund senior companionship and mental-health programs.', '2026-11-07', '13:00:00', 'Care for Seniors Hall', '300 George Street, Sydney NSW', 35.00, 8000.00, 2900.00, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'active'),

('Spring Charity Fun Run (Past)',  2, 1,
 'Our spring fun run that brought together over 800 runners in support of children\'s health.',
 'Spring children\'s health fundraiser.', '2026-09-20', '08:00:00', 'Sydney Olympic Park', 'Olympic Boulevard, Sydney NSW', 25.00, 25000.00, 26100.00, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800', 'active'),

('City Charity Carnival (Past)',   3, 5,
 'A past community carnival featuring games, stalls and live performances.',
 'Community outreach fundraiser.', '2026-08-15', '11:00:00', 'Darling Harbour', 'Darling Harbour, Sydney NSW', 5.00, 9000.00, 9300.00, 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800', 'active'),

('Suspended Marketing Event',      4, 6,
 'This event has been suspended because it did not follow the organisation\'s event policy and should never appear on the website.',
 'Suspended - policy violation.', '2026-10-30', '14:00:00', 'Private Venue', 'Unknown, Sydney NSW', 0.00, 1000.00, 0.00, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'suspended');
