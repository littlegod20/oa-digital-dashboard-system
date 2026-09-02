-- Replace operational seed data. Login users are left unchanged.
-- PIN 2103 is not stored: there is no pin column on any table.
--
-- Do not run bare `psql "$DATABASE_URL"` unless that variable is exported.
-- In Git Bash it is often empty, so psql connects to local user `postgres`
-- (password prompt) on a database that has no app tables.
--
-- Use:
--   npm run db:replace-seed

BEGIN;

DELETE FROM transactions;
DELETE FROM deals;
DELETE FROM contacts;
DELETE FROM team_members;

INSERT INTO team_members (id, name, role, email, phone, avatar, active_deals, total_revenue) VALUES
  ('tm-gerhard',         'Gerhard',         'Operations', 'gerhard@oadigismartsecurity.com',         NULL, NULL, 5, 128000.00),
  ('tm-andrew-quarcoo',  'Andrew Quarcoo',  'Engineering', 'andrew.quarcoo@oadigismartsecurity.com', NULL, NULL, 2,   6000.00),
  ('tm-elorm',           'Elorm',           'Team',       'elorm@oadigismartsecurity.com',           NULL, NULL, 0,      0.00),
  ('tm-victoria',        'Victoria',        'Sales',      'victoria@oadigismartsecurity.com',        NULL, NULL, 1,      0.00),
  ('tm-ahmed',           'Ahmed',           'Team',       'ahmed@oadigismartsecurity.com',           NULL, NULL, 0,      0.00),
  ('tm-saleem',          'Saleem',          'Sales',      'saleem@oadigismartsecurity.com',          NULL, NULL, 0,  33000.00),
  ('tm-sourabh',         'Sourabh',         'Engineering', 'sourabh@oadigismartsecurity.com',        NULL, NULL, 1,   8000.00),
  ('tm-theopholus',      'Theopholus',      'Team',       'theopholus@oadigismartsecurity.com',      NULL, NULL, 0,      0.00);

INSERT INTO deals (
  id, client, title, value, currency, phase, assignee, paid, next_action, notes, created_at, updated_at
) VALUES
  (
    'mt999bstbqvvj',
    'Omni Group',
    'Custom Built software for Operations',
    0, 'GHS', 'progress', 'Gerhard', 0,
    'Complete and work with HR for Pilot',
    'Currently working on Attendance and HR',
    '2026-08-25 00:00:00+00', '2026-08-25 00:00:00+00'
  ),
  (
    'mt9974zaww5yh',
    'Omni Group',
    'Job Card Automation',
    3000, 'GHS', 'progress', 'Andrew Quarcoo', 0,
    '',
    '',
    '2026-08-25 00:00:00+00', '2026-08-25 00:00:00+00'
  ),
  (
    'mrl5mhjuzcsge',
    'GIS',
    'Custom software build for Administration',
    0, 'GHS', 'meet', 'Victoria', 0,
    'Follow up with Nana Serwaa Boateng for a presentation',
    '',
    '2026-07-14 00:00:00+00', '2026-07-14 00:00:00+00'
  ),
  (
    'mrl5c1ntuiwo2',
    'OMNI Group',
    'Way Bill Automation',
    3000, 'GHS', 'progress', 'Andrew Quarcoo', 0,
    '',
    '',
    '2026-07-14 00:00:00+00', '2026-07-14 00:00:00+00'
  ),
  (
    'mrj8jlh8bqhwk',
    'ZKTeco (Supplier)',
    'Order 20 devices via email',
    0, 'USD', 'done', 'Gerhard', 3700,
    '',
    'Procurement, not revenue. Stock for upcoming deployments.',
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  ),
  (
    'mrj8jlh8x2am2',
    'Ashesi University',
    'AAS deployment payment',
    102000, 'GHS', 'progress', 'Gerhard', 50049,
    'Start Deployment',
    $notes$Incoming payment of GHS 54,000.
When the 54,000 lands, transfer $2,500 to the dollar account.$notes$,
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  ),
  (
    'mrj8jlh8qli73',
    'Kizzi (Mining Site)',
    'AAS setup for mining site',
    26000, 'GHS', 'meet', 'Gerhard', 0,
    'Follow up and schedule a meeting with Kizzi.',
    '',
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  ),
  (
    'mrj8jlh8cfxy1',
    'Real Estate Company',
    'AAS deployment',
    33000, 'GHS', 'hold', 'Saleem', 0,
    'Qualify and send proposal.',
    '',
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  ),
  (
    'mrj8jlh8h3p67',
    'Ghana Sports Fund',
    'Proposal submitted',
    0, 'GHS', 'await', 'Gerhard', 0,
    'Awaiting invite for the official presentation.',
    'Value to be confirmed after presentation.',
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  ),
  (
    'mrj8jlh8rzovs',
    'Ministry of Energy & Green Transition',
    'Proposal submitted',
    0, 'GHS', 'await', 'Gerhard', 0,
    'Awaiting feedback on submitted proposal.',
    '',
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  ),
  (
    'mrj8jlh86i2cl',
    'Mr Laryea',
    'Project (changes requested)',
    8000, 'GHS', 'progress', 'Sourabh', 3500,
    'He sent more information; apply the requested changes. Balance of GHS 5,500 outstanding.',
    'Paid 2,500. Balance 5,500.',
    '2026-07-13 00:00:00+00', '2026-07-13 00:00:00+00'
  );

INSERT INTO transactions (
  id, type, description, amount, currency, person, category, date, order_id
) VALUES
  ('mrj8jlh8hqedb', 'income',  'Mr Laryea part payment',            2500,  'GHS', 'Mr Laryea',           'Client payment', '2026-07-13', 'mrj8jlh86i2cl'),
  ('mrj8jlh83jalg', 'expense', 'PPA certificate',                     500,  'GHS', NULL,                  'Compliance',     '2026-07-13', NULL),
  ('mrj8jlh8x4na6', 'expense', 'Team payment to Andrew',             1000,  'GHS', 'Andrew Quarcoo',      'Team payment',   '2026-07-13', NULL),
  ('mrj8jlh8txuif', 'expense', 'Payment to Gerhard',                 1500,  'GHS', 'Gerhard',             'Team payment',   '2026-07-13', NULL),
  ('mrj8jlh88azka', 'expense', 'Additional payment',                 1000,  'GHS', NULL,                  'Operations',     '2026-07-13', NULL),
  ('mrt8iut21ht0a', 'income',  'Ashesi University payment',         50049,  'GHS', 'Ashesi University',   'Client payment', '2026-07-20', 'mrj8jlh8x2am2'),
  ('mrul9wjiyzyk5', 'expense', 'Payment to Andrew Quarcoo',          7000,  'GHS', 'Andrew Quarcoo',      'Team payment',   '2026-07-21', NULL),
  ('mrula4cko6kki', 'expense', 'Payment to Gerhard',                 7000,  'GHS', 'Gerhard',             'Team payment',   '2026-07-21', NULL),
  ('ms62acwsdts4a', 'expense', 'Tax',                                1010,  'GHS', NULL,                  '',               '2026-07-29', NULL),
  ('ms62aq3drhtfa', 'expense', 'Withdrawal for dollar',             24400,  'GHS', NULL,                  '',               '2026-07-29', NULL),
  ('ms62bcmhz1thz', 'income',  'Transaction',                        2000,  'USD', NULL,                  '',               '2026-07-29', NULL),
  ('msceaco46zta9', 'expense', 'Bank Debit card charge',               75,  'GHS', NULL,                  '',               '2026-08-02', NULL),
  ('msceb9qtwun1k', 'expense', 'Google Business Subscription',        160,  'GHS', NULL,                  '',               '2026-08-02', NULL),
  ('mt994ud7h19zu', 'income',  'Mr Laryea payment',                  1000,  'GHS', 'Mr Laryea',           'Client payment', '2026-07-31', 'mrj8jlh86i2cl'),
  ('mt99axvzyq43f', 'expense', 'ZKTeco (Supplier) payment',          1950,  'USD', 'ZKTeco (Supplier)',   'Client payment', '2026-08-25', 'mrj8jlh8bqhwk'),
  ('mt99bhmrkgekj', 'expense', '$150 dollar change',                 1850,  'GHS', NULL,                  '',               '2026-08-25', NULL),
  ('mt99bvgs0k4vx', 'income',  '$150 Dollar change',                  150,  'USD', NULL,                  '',               '2026-08-25', NULL),
  ('mt99ckuc39uc5', 'expense', 'Shipment',                           1800,  'GHS', NULL,                  '',               '2026-08-25', NULL),
  ('mt99cuprkfacj', 'expense', 'Claude',                              800,  'GHS', NULL,                  '',               '2026-08-25', NULL),
  ('mt99dg3dvrfgf', 'expense', 'Payment to Theopholus (Transport)',   200,  'GHS', 'Theopholus',          'Team payment',   '2026-08-25', NULL),
  ('mt99fiou5oul6', 'expense', 'Transportation',                     1000,  'GHS', NULL,                  '',               '2026-08-25', NULL),
  ('mt99fo8dszf27', 'expense', 'Food',                                200,  'GHS', NULL,                  '',               '2026-08-25', NULL),
  ('mt99g9fcfbwo6', 'expense', 'Claude',                              288,  'GHS', NULL,                  '',               '2026-08-25', NULL),
  ('mt99hprnpyw4i', 'expense', 'Payment to Gerhard',                  500,  'GHS', 'Gerhard',             'Team payment',   '2026-08-25', NULL),
  ('mt99iaprkxoum', 'expense', 'Payment to Andrew Quarcoo',           500,  'GHS', 'Andrew Quarcoo',      'Team payment',   '2026-08-25', NULL),
  ('mtbaknns7pt93', 'expense', 'Charges',                              39,  'USD', NULL,                  '',               '2026-08-27', NULL);

INSERT INTO contacts (id, name, company, email, phone, notes, tags, created_at) VALUES
  (
    'mrj8jlh8z9iy7',
    'Nana Kwame',
    'Financing',
    NULL,
    NULL,
    'Borrow $3,000 to finance the 20 ZKTeco devices. Record as Loan received when it arrives.',
    ARRAY['To reach']::text[],
    now()
  ),
  (
    'mrj8jlh8gfvf1',
    'Kizzi',
    'Mining site',
    NULL,
    NULL,
    'Schedule meeting for AAS setup (approx GHS 35,000).',
    ARRAY['Follow up']::text[],
    now()
  ),
  (
    'mrj8jlh81v5fw',
    'Kasapreko',
    'Manufacturing',
    NULL,
    NULL,
    'In-person meeting target for AAS.',
    ARRAY['To reach']::text[],
    now()
  ),
  (
    'mrj8jlh890oh4',
    'Movenpick Ambassador Hotel',
    'Hospitality',
    NULL,
    NULL,
    'In-person meeting target for AAS.',
    ARRAY['To reach']::text[],
    now()
  ),
  (
    'mrj8jlh8xfbtn',
    'Accra Marriott',
    'Hospitality',
    NULL,
    NULL,
    'In-person meeting target for AAS.',
    ARRAY['To reach']::text[],
    now()
  ),
  (
    'mrj8jlh83k7jk',
    'The Bank Hospital',
    'Healthcare',
    NULL,
    NULL,
    'In-person meeting target for AAS.',
    ARRAY['To reach']::text[],
    now()
  );

COMMIT;
