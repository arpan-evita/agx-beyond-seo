# 🔮 AGX Beyond SEO

AGX Beyond SEO is a collaborative, AI-powered SEO audit and optimization platform designed for modern growth and marketing teams. Built with Next.js 14, Tailwind CSS, Apify Actors, and NextAuth.js.

## Key Features

- **SEO Auditing**: Crawls pages speed, metadata issues, local signals, schema structures, and canonical settings.
- **Dynamic SEO Scoring**: Computes real-time health score metrics and generates prioritizing issue cards based on actual crawl outputs.
- **Local SEO & Maps Scraping**: Evaluates search competitors, GBP positions, and keywords optimized for specific areas (like Gurgaon/NCR).
- **PDF Export**: Print-ready styled layouts allow exporting structured SEO reports directly to client-facing PDFs.
- **Team Management**: Role-based access control (RBAC) supporting System Administrators and standard Members.
- **Dynamic Integrations Settings**: Admins can update Apify API Tokens dynamically from the UI.
- **Glassmorphism Dark UI**: Designed with high-end dark theme tokens, interactive micro-animations, and responsive layouts.

---

## Getting Started

### 1. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# NextAuth Session Secret
NEXTAUTH_SECRET=agx-beyond-seo-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Apify API Integration Token
APIFY_API_TOKEN=your_apify_api_token_here

# Default Admin User
ADMIN_EMAIL=admin@agx.com
ADMIN_PASSWORD=agxseo2024
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Initial Login Credentials:**
- **Email:** `admin@agx.com`
- **Password:** `agxseo2024`

---

## Deployment to Vercel

AGX Beyond SEO is fully optimized for one-click deployment to Vercel.

### 1. Initialize GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit of AGX Beyond SEO"
# Push to your GitHub/GitLab repository
```

### 2. Connect to Vercel

1. Log into [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Add the following **Environment Variables** in the Vercel dashboard:
   - `NEXTAUTH_SECRET` (generate a random 32-character string)
   - `NEXTAUTH_URL` (your deployment URL, e.g., `https://your-app.vercel.app`)
   - `APIFY_API_TOKEN` (your Apify Token)
   - `ADMIN_EMAIL` (default admin account email)
   - `ADMIN_PASSWORD` (default admin account password)
5. Click **Deploy**. Vercel will build the production bundle and serve it at a public HTTPS URL.

---

## File Storage (Local Database)

For simplicity and ease of local setup, this app uses a file-based storage manager under the `data/` directory:
- `data/users.json` — Stores registered users, hashes/plain password records, and roles.
- `data/reports.json` — Caches past crawl audits, ratings, page Speed info, and SEO issues.
- `data/settings.json` — Stores system level configurations (like custom Apify tokens).

*Note: For large enterprise production systems, the modules in `lib/store.ts` can be easily swapped with Vercel KV, Redis, or Supabase PostgreSQL.*
