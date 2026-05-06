-- Seed testimonials (10 sample reviews)
INSERT INTO testimonials (name, review, rating, active, display_order, created_at)
VALUES
('Sara Mohamed', 'I''ve been using the booking system for months — it''s fast, reliable and the support team is always responsive. Our bookings have increased noticeably.', 5, true, 0, TIMEZONE('utc', NOW())),
('Atend John', 'Great interface and clear pricing. The real-time availability saved us time when arranging group stays.', 4, true, 1, TIMEZONE('utc', NOW())),
('Ahmed Siddiqui', 'Easy to onboard my team. The portal''s reporting helped us track revenue trends quickly.', 5, true, 2, TIMEZONE('utc', NOW())),
('Fatima Sheikh', 'Good platform overall, though I would like more filtering options in the search results.', 4, true, 3, TIMEZONE('utc', NOW())),
('Mohammed Al-Rashid', 'The visa and group booking workflow is excellent — streamlined our operations for Hajj packages.', 5, true, 4, TIMEZONE('utc', NOW())),
('Sara Al-Mansoori', 'Customer support is helpful and the system rarely has issues. We use it for all supplier communications.', 5, true, 5, TIMEZONE('utc', NOW())),
('John Doe', 'Mostly happy with the platform. One minor bug with date selection, but overall works well for our agency.', 4, true, 6, TIMEZONE('utc', NOW())),
('Aisha Khan', 'Clean UI and easy to teach staff. The content library is great for marketing our packages.', 5, true, 7, TIMEZONE('utc', NOW())),
('Omar Latif', 'Helpful features for itinerary management; would love deeper analytics in future releases.', 4, true, 8, TIMEZONE('utc', NOW())),
('Lina Hassan', 'Solid system — bookings are reliable and payments flow smoothly. Highly recommended for small agencies.', 5, true, 9, TIMEZONE('utc', NOW()));
