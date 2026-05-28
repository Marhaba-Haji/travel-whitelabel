
-- =========================================
-- WEBINAR SETTINGS (single-row config)
-- =========================================
CREATE TABLE public.webinar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,

  title text NOT NULL DEFAULT 'Start or Scale a Global Tourism Business',
  subtitle text NOT NULL DEFAULT 'A 2-hour live masterclass for aspiring travel entrepreneurs and operators who want to scale.',
  eyebrow text NOT NULL DEFAULT 'LIVE MASTERCLASS · 2 HOURS · ENGLISH + HINDI',

  host_name text NOT NULL DEFAULT 'Harab Rasheed',
  host_title text NOT NULL DEFAULT 'Founder, MarhabaDMC',
  host_photo_url text,
  host_bio_markdown text NOT NULL DEFAULT 'Harab Rasheed is the founder of MarhabaDMC, an AI-first Destination Management Company serving travel agents across 14+ countries. With over 14 years of experience in inbound and outbound travel, he has helped 1,000+ agents launch and scale their travel businesses — specializing in Hajj, Umrah, halal travel, and B2B portals. He is the product builder behind voice AI assistants, AI itinerary builders, and visa automation tools used by Indian travel businesses.',

  scheduled_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  duration_minutes integer NOT NULL DEFAULT 120,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',

  price_inr numeric(10,2) NOT NULL DEFAULT 99,
  currency text NOT NULL DEFAULT 'INR',
  is_free boolean NOT NULL DEFAULT false,

  seats_total integer NOT NULL DEFAULT 500,
  seats_reserved_buffer integer NOT NULL DEFAULT 100,

  who_for_beginner jsonb NOT NULL DEFAULT '[
    "You have no background in travel but want to start a business in 2026",
    "You are unsure where to source flights, hotels, visas or itineraries",
    "You want a real, proven blueprint — not a generic startup template",
    "You want to start lean, without a physical office or large investment"
  ]'::jsonb,
  who_for_scaler jsonb NOT NULL DEFAULT '[
    "You already run an agency but revenue has plateaued",
    "You depend too heavily on local walk-in customers or one supplier",
    "You want to add outbound, Hajj/Umrah, or international packages",
    "You want technology (AI, portals, automation) without hiring a tech team"
  ]'::jsonb,

  learning_points jsonb NOT NULL DEFAULT '[
    {"icon":"Compass","title":"The Global Tourism Opportunity in 2026","desc":"Where the money actually flows in inbound, outbound, Hajj/Umrah and corporate travel — and where Indian agents have an unfair advantage."},
    {"icon":"Layers","title":"The 4-Layer Travel Business Model","desc":"Supplier layer, product layer, distribution layer, brand layer — and how to assemble all four without capital."},
    {"icon":"Plug","title":"How to Get Real Supplier Access on Day One","desc":"Flight, hotel, visa and transfer suppliers that work with new agents, with negotiation scripts."},
    {"icon":"Cpu","title":"AI + Automation as Your First 5 Employees","desc":"Voice AI for sales, AI itinerary builders, automated visa checks — what to deploy first."},
    {"icon":"TrendingUp","title":"The Scale-Up Playbook for Existing Agents","desc":"How to break the plateau: outbound packages, B2B portals, white-label storefronts."},
    {"icon":"IndianRupee","title":"Pricing, Margins & Cashflow That Actually Work","desc":"Realistic margin benchmarks for FIT, GIT, Hajj/Umrah and corporate — and how to protect them."},
    {"icon":"Map","title":"Your First 90-Day Action Plan","desc":"Exactly what to do in week 1, month 1 and quarter 1 — measurable milestones."}
  ]'::jsonb,

  agenda jsonb NOT NULL DEFAULT '[
    {"time":"0:00 – 0:15","title":"The state of the travel industry in 2026","desc":"Why timing matters now."},
    {"time":"0:15 – 0:45","title":"The 4-layer business model walkthrough","desc":"Live, with examples."},
    {"time":"0:45 – 1:10","title":"Supplier access + sourcing playbook","desc":"How to get to yes."},
    {"time":"1:10 – 1:30","title":"AI + automation stack demo","desc":"Real tools, real workflows."},
    {"time":"1:30 – 1:50","title":"Scale-up case studies","desc":"From plateau to growth."},
    {"time":"1:50 – 2:00","title":"Q&A + 90-day action plan","desc":"Open mic and next steps."}
  ]'::jsonb,

  bonuses jsonb NOT NULL DEFAULT '[
    {"title":"Travel Business Starter Toolkit (PDF)","desc":"28-page playbook with supplier list, pricing templates, and launch checklist.","value":"₹1,999"},
    {"title":"Supplier Contact Sheet","desc":"Verified flight, hotel and visa suppliers open to working with new agents.","value":"₹2,499"},
    {"title":"30-min 1-on-1 Strategy Call","desc":"Post-webinar private call with our team to map your first 90 days.","value":"₹4,999"}
  ]'::jsonb,

  faqs jsonb NOT NULL DEFAULT '[
    {"q":"Is this webinar for beginners or experienced agents?","a":"Both. The first half is structured for absolute beginners; the second half goes deep on scaling for existing operators."},
    {"q":"Will the session be recorded?","a":"A recording is shared with all paid registrants within 24 hours."},
    {"q":"What language will it be conducted in?","a":"Primarily English, with Hindi explanations where needed."},
    {"q":"Do I need any prior tools or software?","a":"No. Just a laptop or phone, a notebook, and a stable internet connection."},
    {"q":"Is the ₹99 fee refundable?","a":"Yes, full refund if requested within 24 hours after the live session if you feel it did not deliver value."},
    {"q":"Will I get a certificate?","a":"Yes, a participation certificate is emailed to all paid attendees who join live."}
  ]'::jsonb,

  join_url text,
  whatsapp_group_url text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Single-row enforcement
CREATE UNIQUE INDEX webinar_settings_singleton_idx
  ON public.webinar_settings ((singleton)) WHERE singleton = true;

GRANT SELECT ON public.webinar_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webinar_settings TO authenticated;
GRANT ALL ON public.webinar_settings TO service_role;

ALTER TABLE public.webinar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published webinar settings"
  ON public.webinar_settings
  FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Superadmins can read all webinar settings"
  ON public.webinar_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmins can insert webinar settings"
  ON public.webinar_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmins can update webinar settings"
  ON public.webinar_settings
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER trg_webinar_settings_updated_at
  BEFORE UPDATE ON public.webinar_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default row
INSERT INTO public.webinar_settings (singleton) VALUES (true);


-- =========================================
-- WEBINAR REGISTRATIONS
-- =========================================
CREATE TABLE public.webinar_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone_e164 text NOT NULL,
  country_code text,
  dial_code text,
  city text,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  amount_inr numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  txnid text UNIQUE,
  payu_mihpayid text,
  status text NOT NULL DEFAULT 'pending', -- pending | paid | failed | refunded
  confirmation_email_sent_at timestamptz,
  confirmation_whatsapp_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX webinar_registrations_email_idx ON public.webinar_registrations (email);
CREATE INDEX webinar_registrations_status_idx ON public.webinar_registrations (status);
CREATE INDEX webinar_registrations_created_idx ON public.webinar_registrations (created_at DESC);

GRANT INSERT ON public.webinar_registrations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.webinar_registrations TO authenticated;
GRANT ALL ON public.webinar_registrations TO service_role;

ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for webinar"
  ON public.webinar_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Superadmins can view webinar registrations"
  ON public.webinar_registrations
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmins can update webinar registrations"
  ON public.webinar_registrations
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER trg_webinar_registrations_updated_at
  BEFORE UPDATE ON public.webinar_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
