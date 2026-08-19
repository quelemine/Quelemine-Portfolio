# Isaac L. Quelemine — Portfolio Website

Professional portfolio for **Isaac L. Quelemine**, Junior Software Engineer & Full Stack Developer.

🌐 Live: [queleminetech.info](https://queleminetech.info)

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — animations
- **Lucide React** + **React Icons** — icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Personalization

### Add Your Profile Photo
Place your photo at: `public/images/profile.jpg`

### Add Your Resume
Replace: `public/resume.pdf`

### Update Project Data
Edit: `data/projects.ts` — add real GitHub links and project details

### Update Social Links
Edit: `data/socialLinks.ts` — update Instagram and X (Twitter) URLs

## Project Structure

```
├── app/                  # Next.js App Router
├── components/
│   ├── Navbar/
│   ├── Hero/
│   ├── About/
│   ├── Education/
│   ├── Skills/
│   ├── Projects/
│   ├── Communication/
│   ├── Languages/
│   ├── GithubStats/
│   ├── SocialLinks/
│   ├── Contact/
│   └── Footer/
├── data/                 # All content data
│   ├── projects.ts
│   ├── skills.ts
│   ├── education.ts
│   └── socialLinks.ts
└── public/
    ├── images/profile.jpg   ← Add your photo here
    └── resume.pdf           ← Add your resume here
```

## Build

```bash
npm run build
npm start
```
