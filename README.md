# NPU-G Atlanta

Single-page parallax website for **NPU-G Atlanta**: 13 Neighborhoods, One Community.

Inspired by the visual rhythm of [Griffin Catalyst](https://www.griffincatalyst.org): bold display type, serif supporting copy, cyan CTAs, and a motion hero.

## Local development

```bash
npm install
cp .env.example .env.local   # set CONTACT_EMAIL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Forms (Contact + Merch waitlist)

Both forms POST to `/api/contact`.

1. Copy `.env.example` → `.env.local`
2. Set `CONTACT_EMAIL` to the inbox that should receive submissions
3. Optional: set `RESEND_API_KEY` (+ `RESEND_FROM_EMAIL`) to send via Resend instead of FormSubmit

First FormSubmit delivery may require confirming the email address once.

## Sections

| Anchor | Nav label |
| --- | --- |
| `#about` | About Us |
| `#news` | News |
| `#neighborhoods` | 13 Neighborhoods |
| `#events` | Events |
| `#merch` | Merch |
| `#contact` | Contact Us |

## Media

- Brand mark: `public/npu-g-logo.png`
- NPU-G photos: `public/media/` (meetings, leadership, merch)
- Priorities background video: `public/media/atlanta-skyline.mp4` (lazy-loaded near viewport)
