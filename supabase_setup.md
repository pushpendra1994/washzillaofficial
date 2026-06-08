# Supabase Setup

This site can store booking form submissions in Supabase and still work after hosting.

## 1. Create a free Supabase project

- Go to [Supabase pricing](https://supabase.com/pricing) and create a free project.
- In Supabase, open `SQL Editor`.
- Run the SQL from [supabase-schema.sql](/Users/pushpendra1995/Desktop/Pushpendra/Code/supabase-schema.sql).

## 2. Add your public project credentials

Open [supabase-config.js](/Users/pushpendra1995/Desktop/Pushpendra/Code/supabase-config.js) and replace:

- `YOUR_SUPABASE_PROJECT_URL`
- `YOUR_SUPABASE_ANON_KEY`

Use only the public `anon` key. Do not use the `service_role` key in this website.

## 3. How it works

- The booking form saves data into `public.bookings`.
- After saving, the website opens WhatsApp with the same booking details.
- If Supabase is not configured yet, the website still opens WhatsApp and shows a fallback message.

## 4. Recommended dashboard fields

You will see:

- `customer_name`
- `customer_phone`
- `vehicle_type`
- `service_name`
- `booking_date`
- `booking_time`
- `notes`
- `status`
- `created_at`

## 5. Hosting

This setup works on static hosting such as Vercel, Netlify, or GitHub Pages because the data is stored in Supabase, not inside the site itself.
