# EngineerVault

A modern web application for browsing and searching remote job listings, featuring AI-powered capabilities through HuggingFace integration.

## Features

- **Job Listings**: Browse remote jobs from the Remotive API
- **Advanced Search**: Filter by keyword, location, job type, and category
- **Trending Jobs**: Discover recently posted opportunities
- **AI Capabilities**: Text generation, summarization, sentiment analysis, and more via HuggingFace
- **Serverless Architecture**: Optimized for Vercel deployment
- **Production-Ready**: Caching, rate limiting, error handling, and comprehensive logging

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (optional, for future features)
- **AI/ML**: HuggingFace Inference API
- **Job Data**: Remotive API

## Project Structure

```
engineervault/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── docs/          # API documentation
│   │   ├── health/        # Health check endpoint
│   │   ├── huggingface/   # HuggingFace AI endpoints
│   │   └── jobs/          # Job listing endpoints
│   │       ├── [id]/      # Single job details
│   │       ├── categories/ # Job categories
│   │       ├── search/   # Job search
│   │       └── trending/  # Trending jobs
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Core libraries
│   ├── api/              # API utilities
│   │   ├── cache.ts      # In-memory caching
│   │   ├── cors.ts       # CORS configuration
│   │   ├── docs.ts       # API documentation
│   │   ├── errorHandler.ts # Error handling
│   │   ├── huggingfaceService.ts # HuggingFace integration
│   │   ├── rateLimiter.ts # Rate limiting
│   │   ├── remotiveService.ts # Remotive API service
│   │   └── types.ts      # TypeScript types
│   ├── api.ts            # API client
│   ├── data.ts           # Static data
│   └── supabaseClient.ts # Supabase client
├── components/            # React components
├── styles/               # Additional styles
├── types/                # Additional type definitions
├── .env.example          # Environment variables template
├── next.config.mjs      # Next.js configuration
├── package.json          # Dependencies
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

### Jobs API

| Endpoint               | Method | Description                   |
| ---------------------- | ------ | ----------------------------- |
| `/api/jobs`            | GET    | List all jobs with pagination |
| `/api/jobs/search`     | GET    | Search jobs with filters      |
| `/api/jobs/categories` | GET    | Get job categories            |
| `/api/jobs/[id]`       | GET    | Get single job details        |
| `/api/jobs/trending`   | GET    | Get trending jobs             |

### AI API (HuggingFace)

| Endpoint           | Method | Description          |
| ------------------ | ------ | -------------------- |
| `/api/huggingface` | POST   | AI text operations   |
| `/api/huggingface` | GET    | Get available models |

### System API

| Endpoint      | Method | Description       |
| ------------- | ------ | ----------------- |
| `/api/health` | GET    | Health check      |
| `/api/docs`   | GET    | API documentation |

## API Usage Examples

### Fetch Jobs

```bash
curl "http://localhost:3000/api/jobs?page=1&limit=20"
```

### Search Jobs

```bash
curl "http://localhost:3000/api/jobs/search?keyword=react&location=USA"
```

### Get Categories

```bash
curl "http://localhost:3000/api/jobs/categories"
```

### AI Text Generation

```bash
curl -X POST "http://localhost:3000/api/huggingface" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "inputs": "Once upon a time in a distant land",
    "parameters": { "max_new_tokens": 50 }
  }'
```

### AI Summarization

```bash
curl -X POST "http://localhost:3000/api/huggingface" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "summarize",
    "inputs": "Your long text here..."
  }'
```

### Sentiment Analysis

```bash
curl -X POST "http://localhost:3000/api/huggingface" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sentiment",
    "inputs": "I love this job opportunity!"
  }'
```

### Zero-Shot Classification

```bash
curl -X POST "http://localhost:3000/api/huggingface" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "classify",
    "inputs": "This is a great opportunity for software engineers",
    "parameters": {
      "candidate_labels": ["technology", "healthcare", "finance", "education"]
    }
  }'
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Remotive API (optional - uses default)
REMOTIVE_API_URL=https://remotive.com/api/remote-jobs

# HuggingFace (required for AI features)
HUGGINGFACE_API_TOKEN=your-huggingface-token

# Vercel Frontend (for CORS)
VERCEL_FRONTEND_URL=https://your-project.vercel.app
```

## Getting a HuggingFace Token

1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Add it to your environment variables

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Run Production Build

```bash
npm run build
npm start
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint Type    | Limit       | Window   |
| ---------------- | ----------- | -------- |
| General          | 30 requests | 1 minute |
| Search           | 10 requests | 1 minute |
| Detail           | 60 requests | 1 minute |
| AI (HuggingFace) | 10 requests | 1 minute |

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: When the limit resets

## Caching

The API uses in-memory caching to improve performance:

| Endpoint       | TTL        |
| -------------- | ---------- |
| Jobs List      | 3 minutes  |
| Job Details    | 10 minutes |
| Categories     | 15 minutes |
| Search Results | 2 minutes  |
| Trending Jobs  | 3 minutes  |

## Error Handling

All errors return a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Error message",
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_xxx"
  }
}
```

## Available AI Actions

| Action       | Description              | Parameters                          |
| ------------ | ------------------------ | ----------------------------------- |
| `generate`   | Text generation          | inputs, model, parameters           |
| `summarize`  | Text summarization       | inputs, model, parameters           |
| `translate`  | Translation              | inputs, model, parameters           |
| `sentiment`  | Sentiment analysis       | inputs, model                       |
| `embeddings` | Text embeddings          | inputs, model                       |
| `classify`   | Zero-shot classification | inputs, parameters.candidate_labels |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT License
