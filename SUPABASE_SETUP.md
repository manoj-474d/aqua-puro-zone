# Aqua Puro Zone - Supabase Client Orders & Realtime Setup Guide

This guide explains how to connect your **Aqua Puro Zone** water purifier storefront and admin portal to a free **Supabase** backend.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or sign up.
2. Click **"New Project"**.
3. Choose your organization, set a project name (e.g. `aqua-puro-zone-tumakuru`), and set a strong database password.
4. Select the region closest to your customers (e.g. `ap-south-1` **Mumbai** or `ap-southeast-1` **Singapore**).
5. Choose the **Free Plan** and click **"Create new project"**. Provisioning takes ~1-2 minutes.

---

## 2. Execute the Database SQL Schema

1. In your Supabase Project Dashboard, click the **SQL Editor** icon in the left sidebar.
2. Click **"New query"**.
3. Open `supabase/schema.sql` from this codebase, copy the entire content, and paste it into the query box.
4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).
5. You should see `Success. No rows returned` or a summary count `total_orders: 5`.

### What This SQL Does:
- **`orders` table**: Stores customer name, phone, address, Tumakuru locality, order type (`purchase`, `service`, `installation`, `enquiry`), status, and timestamps.
- **Auto-Sequence**: Uses `order_number_seq` and a trigger to assign order numbers like `APZ-0001`, `APZ-0002` automatically.
- **Validation Constraints**: Enforces minimum 10 digits for phone numbers and valid order statuses.
- **`order_items` table**: Links ordered appliances or filters with snapshots of prices.
- **`admins` table**: Registers authorized staff user IDs.
- **Row Level Security (RLS)**: Enforces that anonymous public web visitors can **only INSERT** new orders; they **cannot view or delete** existing orders.
- **Realtime publication**: Adds `orders` and `order_items` to `supabase_realtime`.
- **Seed Data**: Populates 5 initial Tumakuru sample orders.

---

## 3. Enable Realtime Broadcasting

1. In the Supabase sidebar, go to **Database** -> **Publications**.
2. Click on **`supabase_realtime`**.
3. Ensure both **`orders`** and **`order_items`** are toggled **ON**.
4. (Optional) Run this SQL to verify:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
   ```

---

## 4. Create Your First Admin User

1. In Supabase Dashboard, go to **Authentication** -> **Users**.
2. Click **"Add user"** -> **"Create user"**.
3. Enter:
   - **Email**: `admin@aquapurozone.com` (or your personal email)
   - **Password**: choose a secure password (e.g., `tumakuru@2026`)
   - Toggle **"Auto Confirm User?"** to **ON**.
4. Click **"Create user"**.
5. Copy the generated **User UID** (a UUID like `e54f9a01-4b72-...`).
6. Go back to **SQL Editor** and run:
   ```sql
   INSERT INTO public.admins (user_id, email, role)
   VALUES ('YOUR_USER_UID_HERE', 'admin@aquapurozone.com', 'admin')
   ON CONFLICT (email) DO NOTHING;
   ```

*(Note: The app also supports a 1-click Demo Admin login mode with `admin@aquapurozone.com` / `admin123` for quick evaluation before linking Supabase).*

---

## 5. Configure Frontend Environment Variables

1. In Supabase Dashboard, click **Project Settings** (gear icon) -> **API**.
2. Copy your **Project URL** and **anon public** API key.
3. Open or create your `.env` file in the project root:
   ```bash
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
4. **Security Notice**: Never expose the `service_role` secret key in client environment variables. Only use the public `anon` key.

### Or configure live in the UI without restarting:
1. Click the **"Connect Supabase"** button in the storefront header or in the **Order Modal**.
2. Paste the **Project URL** and **anon Key**.
3. Click **"Test Connection & Check orders Table"** to confirm table exists.
4. Click **"Save & Connect Live"**.

---

## 6. Troubleshooting: "Order Not Showing in Supabase"

If an order you placed is not showing up in your Supabase table:

1. **Check if "orders" table exists in your Supabase project:**
   - In the app, click **"Connect Supabase"** (or Admin Panel > Supabase Connection).
   - Click **"Test Live Connection"**.
   - If it says *"Connected to Supabase, but the 'orders' table does not exist"*, open Supabase SQL Editor, paste `supabase/schema.sql`, and click **Run**.

2. **Check your Project URL and Anon Key:**
   - Ensure the URL starts with `https://` and ends with `.supabase.co` (no trailing slash).
   - Ensure the key is the public `anon` key (starts with `eyJ...`), NOT the `service_role` key.
   - Quotation marks (`"`) are automatically stripped, but verify no trailing spaces.

3. **Check Row Level Security (RLS) policies:**
   - In Supabase SQL Editor, verify that the `orders` table has `Allow public order creation` policy enabled:
     ```sql
     CREATE POLICY "Allow public order creation" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
     CREATE POLICY "Allow read access to orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
     ```

4. **Phone Number Format:**
   - The database requires at least 10 digits for the phone number. The app auto-cleans formatting characters.

---

## 7. Deploying to Vercel / Netlify

1. Push your repository to GitHub.
2. In **Vercel** or **Netlify**, import the repository.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJI...`
4. Set Build Command: `npm run build` and Output Directory: `dist`.
5. Deploy!

