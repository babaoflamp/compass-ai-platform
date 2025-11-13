# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**COMPASS** (Competency Oriented Mentoring Platform with AI Support System) is an AI-powered learning support platform for university students and instructors.

**Tech Stack**: Next.js 15 (App Router) + React 19 + TypeScript + Prisma 6 + SQLite + Ollama (exaone3.5:7.8b) + Tailwind CSS v4

**MVP Philosophy**: Prioritize working simple features over complex ones. Start with CSV uploads, defer LMS integration. Use local LLM (Ollama) for zero-cost AI inference.

## Development Commands

### Basic Workflow

```bash
# Install dependencies
npm install

# Database initialization (first time or after schema changes)
npx prisma generate          # Generate Prisma Client types
npx prisma migrate dev       # Apply migrations
npx prisma db seed          # Seed sample course data

# Development
npm run dev                  # Start dev server (http://localhost:3000)
npm run build               # Production build
npm start                   # Production server
npm run lint                # ESLint

# Database management
npx prisma studio           # Open database GUI
npx prisma db push          # Push schema changes (prototyping only)
npx prisma migrate dev --name description  # Create new migration
```

### Environment Setup

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL`: SQLite file path (default: `file:./dev.db`)
- `OLLAMA_URL`: Ollama server URL (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model name (default: `exaone3.5:7.8b`)

**Important**: Ensure Ollama server is running before starting the app. The exaone3.5:7.8b model must be pulled:
```bash
docker exec ollama ollama pull exaone3.5:7.8b
```

## Architecture

### Data Model Pattern

**Critical**: Student competencies and Course competency weights are stored as JSON strings in the database. Always parse before use:

```typescript
// Reading
const student = await prisma.student.findUnique({ where: { studentId } })
const competencies = JSON.parse(student.competencies)
// competencies = { creativity: 75, collaboration: 82, problemSolving: 68 }

// Writing
await prisma.student.create({
  data: {
    studentId: '20240001',
    name: '홍길동',
    competencies: JSON.stringify({ creativity: 75, collaboration: 82, problemSolving: 68 })
  }
})
```

### Component Architecture

**Server Components First**: Use Server Components by default. Only add `'use client'` when client state, interactivity, or browser APIs are needed.

**Server Component** (default - no directive):
- Direct database access via Prisma
- Fetches data at build/request time
- Example: `app/(student)/dashboard/page.tsx` uses `'use client'` because it needs interactive state for student selection

**Client Component** (`'use client'`):
- Interactive UI (dropdowns, forms, charts)
- Browser APIs, event handlers, useState/useEffect
- Example: `components/charts/CompetencyChart.tsx` uses Recharts

### API Route Pattern

All API routes follow this structure:

1. **Validation**: Check required parameters, return 400 if missing
2. **Data Retrieval**: Query database via Prisma
3. **AI Processing** (if applicable): Call Ollama API via chatCompletion()
4. **Database Recording**: Save AI interactions (Recommendation, ChatLog, UsageStats)
5. **Error Handling**: Try-catch with 500 response

See `app/api/recommend/route.ts` and `app/api/chat/route.ts` for reference implementations.

### AI Integration Points

**1. Course Recommendation** (`POST /api/recommend`):
- Calculates competency match scores using weighted average formula:
  ```typescript
  matchScore =
    studentCompetencies.creativity * courseWeights.creativity +
    studentCompetencies.collaboration * courseWeights.collaboration +
    studentCompetencies.problemSolving * courseWeights.problemSolving
  ```
  - Student competencies: 0-100 scale
  - Course weights: 0.0-1.0 scale (sum doesn't need to equal 1.0)
  - Match score represents how well student strengths align with course requirements
- Sorts courses by match score (descending) and returns top 5
- Uses Ollama (exaone3.5:7.8b) to generate personalized recommendation reasons
- Stores all recommendations in Recommendation table with pending status
- Falls back to basic scoring with generic reasons if Ollama server unavailable

**2. RAG-based Tutor** (`POST /api/chat`):
- Simple keyword-based material search (no vector DB in MVP)
- Uses `simpleSearch()` function: splits query into words, counts keyword occurrences in material content
- Passes top 3 relevant materials as context to Ollama (max 1500 chars per material)
- System prompt restricts answers to provided course materials only
- Stores chat history in ChatLog with confidence score (calculated as: `min(relevantMaterials.length / 3, 1) * 100`)
- Returns 503 error if Ollama server is unavailable (no fallback for chat)

**Ollama Configuration**:
- Model: `exaone3.5:7.8b` (Korean language optimized)
- Temperature 0.3 for tutor (factual), 0.7 for advisor (creative)
- Max tokens: 800
- Zero cost (runs locally)

### File Upload Pattern

CSV uploads (students, courses) use **Zod for validation** and **papaparse** for parsing. See `app/api/upload/students/route.ts`:

```typescript
import { z } from 'zod'

// Define validation schema
const StudentSchema = z.object({
  studentId: z.string().min(1),
  name: z.string().min(1),
  creativity: z.coerce.number().min(0).max(100),
  collaboration: z.coerce.number().min(0).max(100),
  problemSolving: z.coerce.number().min(0).max(100),
})

// Validate and insert with upsert (update if exists, create if not)
await prisma.student.upsert({
  where: { studentId: validatedData.studentId },
  update: { /* fields */ },
  create: { /* fields */ }
})
```

**Key Points**:
- Use `z.coerce.number()` to convert string CSV values to numbers
- Use `upsert` instead of `create` to handle duplicate student IDs gracefully
- Return detailed error messages with row numbers for failed validations

PDF uploads (course materials) should extract text content and store in CourseMaterial table. Vector embeddings (`embeddingId`) are optional for MVP.

## Prisma Schema Key Points

### Models

- **Student**: `competencies` field is JSON string `{ creativity, collaboration, problemSolving }`
- **Course**: `competencyWeights` field is JSON string with same keys (0.0-1.0 scale)
- **CourseEnrollment**: Links students to courses with semester/grade
- **CourseMaterial**: Stores PDF text content; `embeddingId` for future vector DB integration
- **ChatLog**: Records Q&A with `sources` (JSON array) and confidence score
- **Recommendation**: AI-generated suggestions with `status` (pending/approved/rejected)
- **UsageStats**: Tracks API usage and estimated costs

### Unique Constraints

- `Student.studentId` is unique (student number)
- `Course.code` is unique (course code)
- `CourseEnrollment` has composite unique constraint on `[studentId, courseId, semester]`

## TypeScript Conventions

### Path Aliases

Use `@/` for project root imports:

```typescript
import { prisma } from '@/lib/db'
import { chatCompletion, checkOllamaHealth } from '@/lib/ollama'
import CompetencyChart from '@/components/charts/CompetencyChart'
```

### Type Safety

- Define interfaces for API responses and component props
- Use Prisma-generated types where possible
- Parse JSON fields with proper typing:

```typescript
interface Competencies {
  creativity: number
  collaboration: number
  problemSolving: number
}

const competencies: Competencies = JSON.parse(student.competencies)
```

## Tailwind CSS v4 Notes

**Import Syntax**: Tailwind v4 uses `@import "tailwindcss"` instead of `@tailwind` directives in `app/globals.css`.

**Utility-First**: Always use Tailwind utilities; avoid custom CSS unless absolutely necessary.

**Responsive Design**: Use `md:`, `lg:` prefixes for responsive layouts.

## Common Pitfalls

1. **Forgetting to parse JSON fields**: Always `JSON.parse()` competencies and competencyWeights before use
2. **Missing Prisma Client generation**: Run `npx prisma generate` after schema changes
3. **Ollama server not running**: Ensure Ollama is running and exaone3.5:7.8b model is pulled
4. **Server vs Client components**: Don't use Prisma in client components (use API routes)
5. **Database migrations**: Use `npx prisma migrate dev` (not `db push`) for production-ready changes
6. **Prisma singleton in hot reload**: The `lib/db.ts` singleton pattern prevents multiple Prisma instances during development hot reloads
7. **Defensive AI response parsing**: Always use try-catch when parsing JSON responses from Ollama, as LLM output may be malformed

## Development Workflow

### Adding a New Feature

1. **Update Prisma schema** (if database changes needed)
2. **Create migration**: `npx prisma migrate dev --name feature_name`
3. **Add API route** in `app/api/` if server logic needed
4. **Create page/component** in `app/` or `components/`
5. **Test locally**: `npm run dev`
6. **Type check**: Run TypeScript compiler to verify types

### Working with AI Features

When modifying Ollama integration:
- Keep prompts concise for faster inference
- Include system prompts that constrain AI behavior
- Parse AI responses defensively (try-catch for JSON parsing)
- Log token usage for statistics (see `lib/ollama.ts`)
- Test with and without Ollama server running to ensure fallbacks work
- Monitor GPU/CPU usage if performance becomes an issue

### Database Seeding

The seed file (`prisma/seed.ts`) creates 10 sample courses. Run with:

```bash
npx prisma db seed
```

To add students, use the CSV upload UI at `/upload` or create seed data programmatically.

## API Endpoints Reference

- `POST /api/recommend` - Generate course recommendations for student
  - Body: `{ studentId: string }`
  - Returns: Top 5 courses with AI-generated reasons

- `POST /api/chat` - AI tutor Q&A
  - Body: `{ studentId: string, courseId?: number, question: string }`
  - Returns: `{ answer: string, sources: [], confidence: number }`

- `GET /api/students` - List all students
- `GET /api/students/:studentId` - Get student detail with competencies and enrollments

- `POST /api/upload/students` - Upload student CSV
  - Body: FormData with CSV file
  - CSV columns: `studentId, name, department, grade, creativity, collaboration, problemSolving`

- `POST /api/materials` - Upload course material PDF
  - Body: FormData with PDF file and courseId

## Project Structure

```
app/
├── (student)/          # Student-facing pages (dashboard, advisor, tutor)
│   ├── layout.tsx      # Student layout wrapper
│   ├── dashboard/      # Competency visualization
│   ├── advisor/        # AI course recommendations
│   └── tutor/          # RAG-based Q&A chat
├── (admin)/            # Admin pages (upload, materials)
│   ├── layout.tsx      # Admin layout wrapper
│   ├── upload/         # CSV data upload UI
│   └── materials/      # Course material management
├── api/                # API routes (recommend, chat, upload, students)
│   ├── chat/           # RAG tutor endpoint
│   ├── recommend/      # Course recommendation endpoint
│   ├── students/       # Student CRUD operations
│   ├── materials/      # Material upload endpoint
│   └── upload/         # CSV upload endpoints
├── layout.tsx          # Root layout with theme provider
├── page.tsx            # Home page
└── globals.css         # Tailwind v4 imports

components/
├── ui/                 # Reusable UI components (Button, Card, Select, etc.)
├── charts/             # Data visualization (Recharts)
├── navigation/         # Navigation components (Sidebar, TopBar, Breadcrumb)
└── providers/          # React context providers (ToastProvider)

lib/
├── db.ts               # Prisma singleton with logging
├── ollama.ts           # Ollama client + token tracking utility
├── fonts.ts            # Font configuration
└── utils.ts            # Utility functions (cn, clsx)

prisma/
├── schema.prisma       # Database schema
├── migrations/         # Migration history
├── seed.ts             # Seed data script (10 sample courses)
└── dev.db              # SQLite database file
```

## UI Component Library

The project uses custom UI components in `components/ui/`:
- **Button**: Button component with variant support
- **Card**: Card, CardHeader, CardTitle, CardContent for layouts
- **Select**: Dropdown select component
- **Badge**: Label/tag component
- **Loading**: Spinner/loading indicator
- **EmptyState**: Empty state placeholder
- **Modal**: Modal/dialog component
- **Input/Textarea**: Form input components

Components use **class-variance-authority** (cva) for variant management and **clsx**/**tailwind-merge** (via `lib/utils.ts`) for conditional class names.

## Navigation Architecture

Layout components are split by user role:
- `app/(student)/layout.tsx`: Wraps student-facing pages (dashboard, advisor, tutor)
- `app/(admin)/layout.tsx`: Wraps admin pages (upload, materials)
- `components/navigation/`: Reusable navigation components (Sidebar, TopBar, Breadcrumb, MobileNav, SkipLink)

The root `app/layout.tsx` includes the theme provider (next-themes) for dark mode support.

## Testing and Debugging

### Database Inspection
```bash
npx prisma studio  # Visual database browser at http://localhost:5555
```

### Ollama Health Check
The `lib/ollama.ts` exports `checkOllamaHealth()` to verify server availability before making LLM calls. Always check health status and provide fallback behavior.

### API Testing
Test API routes with curl or Thunder Client:
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"studentId": "20240001"}'
```

## Future Enhancements (Post-MVP)

- Replace keyword search with vector embeddings (ChromaDB/Pinecone)
- Add instructor approval workflow for recommendations
- Implement LMS integration (Moodle/Canvas)
- Multi-model support (switch between Ollama models)
- Add cloud LLM option (OpenAI, Claude) for comparison
- Real-time inference monitoring dashboard
- Student authentication (NextAuth or SSO)
