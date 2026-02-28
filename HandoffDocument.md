# GGWA Feedback & Job Photo Delivery Tool — Project Spec

## Overview

A simple web application for Graffiti Gone WA (GGWA) that serves two purposes:
1. **Deliver completed job photos** to customers via a professional branded email
2. **Collect structured feedback** (Airbnb-style ratings + review) from customers via an embedded form link

The tool replaces the need to ask for Google Reviews (most GGWA clients are blue-chip companies who won't do that) and instead captures testimonials and satisfaction data directly.

---

## Users & Access

| User | Role | Access |
|------|------|--------|
| **Chris** (GGWA operator) | Primary user — sends emails, uploads photos, views feedback | Simple PIN/password login |
| **Larra** (remote admin) | Admin — views feedback dashboard, manages settings | Same simple auth |

**Auth approach:** Simple shared PIN or basic password — no full auth system needed. Just enough to prevent public access.

---

## Tech Stack (Free Tier)

| Layer | Tool | Why |
|-------|------|-----|
| **Frontend** | Next.js (or plain React + Vite) | Simple, deployable, mobile-friendly |
| **Backend/DB** | Supabase (free tier) | Postgres DB, file storage for photos, auth if needed |
| **Email sending** | Resend (free tier: 100 emails/day) | Simple API, good templates, reliable delivery |
| **Hosting** | Vercel (free tier) | Easy Next.js deployment, custom domain later |
| **File storage** | Supabase Storage | Store uploaded job photos, served via CDN URLs |

---

## Core Workflows

### Workflow 1: Chris Sends Job Completion Email

1. Chris logs into the web app (browser, desktop — doesn't need to be mobile-optimized but should work on mobile)
2. Chris fills out a simple form:
   - **Customer email address** (required)
   - **Customer name** (required)
   - **Job reference / description** (optional, e.g. "Graffiti removal — 123 Murray St")
   - **Upload photos** (multiple file upload — before/after or just after photos of completed work)
3. Chris clicks **"Send"**
4. The tool:
   - Uploads photos to Supabase Storage
   - Generates a branded email using the template (see below)
   - Sends via Resend API
   - Logs the job in the database (customer, date, photos, feedback status)
5. Chris sees a confirmation: "Email sent to [customer]"

### Workflow 2: Customer Receives Email & Gives Feedback

1. Customer receives a professional email with:
   - GGWA logo at the top
   - Friendly message thanking them for choosing GGWA
   - **Embedded job photos** (or thumbnail gallery linking to full-size)
   - A clear **"Share Your Feedback"** button/link
2. Customer clicks the feedback link → opens a simple web form (public, no login required)
3. Customer fills out the Airbnb-style feedback form (see form spec below)
4. Customer submits → sees a thank-you message
5. System:
   - Saves feedback to Supabase
   - Sends email notification to Chris and/or Larra

### Workflow 3: Viewing Feedback (Dashboard)

1. Chris or Larra logs in
2. Dashboard shows:
   - List of all jobs sent (date, customer, feedback status: pending/received)
   - Click into any job to see: photos sent, feedback received (ratings + comments)
   - Simple summary stats (average ratings, total feedback collected)
   - Filter by: date range, feedback status

---

## Email Template Spec

**From:** A GGWA-branded sender (e.g. `jobs@graffitionewa.com.au` or similar — Resend allows custom domains)
**Subject:** "Your completed job photos from Graffiti Gone WA"

**Email body structure:**

```
[GGWA Logo]

Hi [Customer Name],

Thank you for choosing Graffiti Gone WA! 

We've completed the work at [Job Reference], and here are your finished job photos:

[Photo Grid — 2-3 photos displayed inline, or thumbnails if many]

We'd really appreciate hearing how we did! It takes less than 2 minutes and helps us keep improving our service.

[ Leave a Quick Review → ]  (button linking to feedback form)

Thanks again,
The Graffiti Gone WA Team

[Small footer with contact info]
```

**Design notes:**
- Clean, minimal design
- GGWA logo at top
- Photos displayed nicely (not as attachments — inline or linked thumbnails)
- Single clear CTA button for feedback
- Mobile-responsive email template

---

## Feedback Form Spec (Airbnb-Style)

**URL:** `[app-domain]/feedback/[unique-job-id]`

**Page layout:** Clean, branded, mobile-friendly single-page form

### Form Fields:

#### 1. Overall Satisfaction (required)
- **Star rating (1-5 stars)**
- Label: "How satisfied were you with the overall service?"

#### 2. Quality of Work (required)
- **Star rating (1-5 stars)**
- Label: "How would you rate the quality of work?"

#### 3. Professionalism & Communication (required)
- **Star rating (1-5 stars)**
- Label: "How would you rate our professionalism and communication?"

#### 4. Written Feedback (optional)
- **Text area**
- Placeholder: "Tell us more about your experience... (optional)"
- Max ~500 characters

#### 5. Testimonial Permission (optional)
- **Checkbox**
- Label: "I'm happy for Graffiti Gone WA to use my feedback as a testimonial"
- Default: unchecked

### Form UX:
- Stars should be clickable/tappable (large touch targets)
- Show a brief "Thank you! Your feedback has been submitted." confirmation on submit
- No login required — the unique job ID in the URL links the feedback to the right job
- Form should be disabled/show message if feedback already submitted for this job
- Clean, minimal styling with GGWA logo at top

---

## Database Schema (Supabase/Postgres)

### `jobs` table
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  job_reference TEXT,
  photo_urls TEXT[] NOT NULL, -- array of Supabase Storage URLs
  email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_status TEXT DEFAULT 'pending', -- 'pending' | 'received'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `feedback` table
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) NOT NULL UNIQUE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER NOT NULL CHECK (professionalism_rating BETWEEN 1 AND 5),
  comment TEXT,
  testimonial_permission BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `settings` table (optional, for future)
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- e.g., notification_email, company_name, etc.
```

---

## Pages / Routes

| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/` | Login page (simple PIN entry) | No |
| `/send` | Job photo upload + email sender form | Yes |
| `/dashboard` | List of all jobs + feedback overview | Yes |
| `/dashboard/[job-id]` | Detail view of a specific job + its feedback | Yes |
| `/feedback/[job-id]` | Public feedback form for customers | **No** |
| `/feedback/[job-id]/thanks` | Thank you confirmation after submission | **No** |

---

## Notification Emails

When feedback is submitted, send a simple notification email to configured address(es):

**Subject:** "New feedback received — [Customer Name]"
**Body:**
```
New feedback for: [Job Reference]
Customer: [Customer Name]

Overall: ⭐⭐⭐⭐⭐ (5/5)
Quality: ⭐⭐⭐⭐ (4/5)
Professionalism: ⭐⭐⭐⭐⭐ (5/5)

Comment: "Great work, very professional team..."

Testimonial permission: ✅ Yes

View in dashboard: [link]
```

---

## MVP Scope (v1) vs Future Nice-to-Haves

### ✅ MVP (Build This)
- Simple PIN auth for Chris/Larra
- Photo upload + email sending form
- Branded email template with inline photos + feedback CTA
- Public Airbnb-style feedback form (3 star ratings + comment + testimonial checkbox)
- Feedback dashboard (list view + detail view)
- Email notification when feedback received
- Basic job listing with feedback status

### 🔜 Future (v2+)
- GGWA custom domain email sending
- Auto follow-up reminders for non-responders
- Export feedback to CSV
- Testimonial showcase page (public, using permitted feedback)
- Photo gallery / portfolio page
- Multiple team member accounts
- Custom branding settings
- Analytics (response rates, average ratings over time)
- Before/after photo comparison slider on feedback page

---

## GGWA Branding Assets Needed

- **Logo:** GGWA logo file (PNG with transparent background preferred)
- **Brand colors:** If any specific colors are used (otherwise default to clean/professional)
- **Contact info:** Phone, email, website for email footer

For MVP, use the logo and keep everything else minimal/clean. Can be branded further in v2.

---

## Key Technical Decisions

1. **Photos in emails:** Use Supabase Storage public URLs embedded as `<img>` tags in the email HTML. Don't attach files — keeps emails lightweight and photos always accessible.

2. **Feedback form security:** The unique job UUID in the URL is sufficient security for v1. It's unguessable and single-use (one feedback per job). No CAPTCHA needed initially.

3. **Email sending:** Resend free tier allows 100 emails/day and 3,000/month — more than enough for GGWA's volume. Set up with Resend's default domain first, add custom domain later.

4. **Photo storage:** Supabase Storage free tier gives 1GB — sufficient for job photos. Use image compression on upload (resize to max 1200px wide) to conserve space.

5. **Deployment:** Vercel free tier with automatic deployments from GitHub. No custom domain needed for MVP.

---

## Development Order (Suggested for Claude Code)

### Phase 1: Foundation
1. Set up Next.js project with Tailwind CSS
2. Set up Supabase project (database + storage)
3. Create database tables
4. Implement simple PIN auth (middleware + cookie/session)

### Phase 2: Core — Sending
5. Build the `/send` page (form + photo upload)
6. Implement photo upload to Supabase Storage
7. Build the email HTML template
8. Integrate Resend API for email sending
9. Save job records to database

### Phase 3: Core — Feedback
10. Build the public `/feedback/[job-id]` page (star ratings + form)
11. Implement feedback submission + save to database
12. Update job status to 'received' when feedback comes in
13. Send notification email on feedback submission

### Phase 4: Dashboard
14. Build `/dashboard` — job list with status
15. Build `/dashboard/[job-id]` — detail view with photos + feedback
16. Add basic summary stats (average ratings, response rate)

### Phase 5: Polish
17. Add GGWA logo to email template and feedback form
18. Responsive design pass
19. Error handling and loading states
20. Deploy to Vercel

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# App
APP_PIN=          # Simple shared PIN for admin access
NOTIFICATION_EMAIL=  # Where to send feedback notifications
FROM_EMAIL=       # Sender email address (Resend verified)
```

---

## Notes for Claude Code

- Keep it simple — this is a tool for a tradie, not a SaaS product
- Prioritize "it works" over "it's perfect"
- Use server actions or API routes for Resend/Supabase calls (keep keys server-side)
- The feedback form must work flawlessly on mobile (customers will open the email on their phone)
- Image compression on upload is important to stay within free tier storage limits
- The star rating component should be satisfying to use (good touch targets, visual feedback)
