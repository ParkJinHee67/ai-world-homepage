-- Add purchase_url to portfolio_items (run once in Supabase SQL Editor)
alter table portfolio_items add column if not exists purchase_url text;
