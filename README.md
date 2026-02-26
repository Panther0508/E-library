# EngineerVault

EngineerVault is a modern, dark-themed AI-powered engineering eLibrary prototype built with Next.js + React + TailwindCSS.

## Features

- Futuristic landing page with animated blueprint background
- Role-based auth panel (Student / Researcher / Contributor / Admin)
- Personalized dashboard cards, bookmarks, and recommendations
- Engineering categories and resource type modules
- Advanced filtering (field, file type, level, year) + AI suggestions
- Contributor upload flow with admin approval status panel
- AI study assistant preview chat
- Code snippets with syntax highlighting
- Mobile-responsive dark UI with dark gold accents (`#B8860B`)

## Stack

- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Supabase client scaffold for backend integration

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional Supabase setup

Set environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

A ready-to-use client helper is in `lib/supabase.ts`.
