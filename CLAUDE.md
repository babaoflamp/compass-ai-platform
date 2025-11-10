# COMPASS - Claude Code Development Guide

이 파일은 Claude Code가 COMPASS 프로젝트를 개발할 때 참고하는 가이드입니다.

## 프로젝트 개요

**COMPASS** (Competency Oriented Mentoring Platform with AI Support System)는 대학교 학습 지원을 위한 AI 플랫폼입니다.

## 기술 스택

- **Frontend**: Next.js 15 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (개발) / PostgreSQL (프로덕션 예정)
- **ORM**: Prisma 6
- **AI**: OpenAI API (gpt-4o-mini)
- **Charts**: Recharts

## 개발 원칙

### 1. MVP 우선
- 복잡한 기능보다 **동작하는 단순한 기능** 우선
- 교수자 검증 워크플로우, 멀티 LLM 등은 나중에 구현
- CSV 업로드로 시작, LMS 연동은 나중에

### 2. 타입 안전성
- 모든 함수와 컴포넌트에 TypeScript 타입 명시
- Prisma 스키마로 DB 타입 자동 생성
- Zod로 API 요청/응답 검증

### 3. 서버 컴포넌트 우선
- 가능한 한 Server Components 사용
- 클라이언트 상태가 필요할 때만 `'use client'`
- API 호출은 서버 액션 또는 Route Handler

### 4. AI 비용 최적화
- gpt-4o-mini 사용 (gpt-4보다 저렴)
- 프롬프트 토큰 최소화
- 응답 캐싱 고려

## 디렉토리 구조

```
app/
├── (auth)/login/          # 로그인 (나중에)
├── (student)/             # 학생용 페이지
│   ├── dashboard/         # 역량 대시보드
│   ├── advisor/           # AI 추천
│   └── tutor/             # AI 튜터
├── (admin)/               # 관리자 페이지
│   ├── upload/            # CSV/PDF 업로드
│   └── analytics/         # 통계
└── api/                   # API Routes
    ├── chat/route.ts      # 튜터 채팅
    ├── recommend/route.ts # 과목 추천
    └── upload/route.ts    # 파일 업로드
```

## 데이터베이스

### Prisma 사용법

```typescript
import { prisma } from '@/lib/db'

// 학생 조회
const student = await prisma.student.findUnique({
  where: { studentId: '20240001' }
})

// 과목 추천 저장
await prisma.recommendation.create({
  data: {
    studentId: student.id,
    courseId: course.id,
    reason: '프로그래밍 역량 향상에 도움',
    score: 0.85
  }
})
```

### JSON 필드 사용
Student.competencies와 Course.competencyWeights는 JSON string으로 저장:

```typescript
// 저장
const student = await prisma.student.create({
  data: {
    studentId: '20240001',
    name: '홍길동',
    competencies: JSON.stringify({
      creativity: 75,
      collaboration: 82,
      problemSolving: 68
    })
  }
})

// 조회 및 파싱
const competencies = JSON.parse(student.competencies)
console.log(competencies.creativity) // 75
```

## OpenAI API 사용

### 과목 추천 예시

```typescript
import { openai } from '@/lib/openai'

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: '당신은 대학 학습 어드바이저입니다. 학생의 역량 데이터를 보고 적합한 과목을 추천하세요.'
    },
    {
      role: 'user',
      content: `학생 역량: ${JSON.stringify(competencies)}\n\n추천할 과목 3개와 이유를 알려주세요.`
    }
  ],
  temperature: 0.7,
  max_tokens: 500
})

const recommendation = completion.choices[0].message.content
```

### RAG 튜터링 예시

```typescript
// 1. 벡터 검색으로 관련 교안 찾기 (TODO: ChromaDB 연동)
const relevantDocs = await searchCourseMaterials(question, courseId)

// 2. GPT에 컨텍스트 제공
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: `다음 교안 내용만 사용해서 답변하세요:\n\n${relevantDocs.join('\n\n')}`
    },
    {
      role: 'user',
      content: question
    }
  ]
})
```

## API Routes 패턴

### POST /api/recommend

```typescript
// app/api/recommend/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json()

    // 1. 학생 데이터 조회
    const student = await prisma.student.findUnique({
      where: { studentId }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // 2. OpenAI로 추천 생성
    const competencies = JSON.parse(student.competencies)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [/* ... */]
    })

    // 3. 결과 저장 및 반환
    const recommendations = parseRecommendations(completion.choices[0].message.content)

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 컴포넌트 패턴

### 서버 컴포넌트 (기본)

```typescript
// app/(student)/dashboard/page.tsx
import { prisma } from '@/lib/db'
import CompetencyChart from '@/components/charts/CompetencyChart'

export default async function DashboardPage() {
  // 서버에서 직접 DB 조회
  const student = await prisma.student.findUnique({
    where: { studentId: '20240001' } // 실제로는 인증에서 가져옴
  })

  const competencies = JSON.parse(student.competencies)

  return (
    <div>
      <h1>{student.name}님의 역량 분석</h1>
      <CompetencyChart data={competencies} />
    </div>
  )
}
```

### 클라이언트 컴포넌트 (필요시만)

```typescript
// components/charts/CompetencyChart.tsx
'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

export default function CompetencyChart({ data }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: key,
    score: value
  }))

  return <RadarChart data={chartData}>{/* ... */}</RadarChart>
}
```

## 개발 워크플로우

### 1. 새 기능 개발 시

```bash
# 1. Prisma 스키마 수정 (필요시)
# prisma/schema.prisma 편집

# 2. 마이그레이션 생성
npx prisma migrate dev --name add_new_feature

# 3. 컴포넌트/API 개발
# app/... 또는 components/... 편집

# 4. 테스트
npm run dev

# 5. 타입 체크
npx tsc --noEmit
```

### 2. 데이터베이스 조작

```bash
# GUI로 데이터 확인/편집
npx prisma studio

# 스키마 변경 후 DB 푸시 (개발 중)
npx prisma db push

# 프로덕션용 마이그레이션
npx prisma migrate deploy
```

## 코딩 컨벤션

### 파일명
- 컴포넌트: `PascalCase.tsx`
- 유틸리티: `camelCase.ts`
- API 라우트: `route.ts`

### 함수명
- 컴포넌트: `PascalCase`
- 함수: `camelCase`
- 서버 액션: `actionName` (동사로 시작)

### 주석
```typescript
// ✅ 좋은 예: 왜 이렇게 했는지 설명
// gpt-4 대신 gpt-4o-mini 사용 - 비용 절감 (10배 저렴)
const model = 'gpt-4o-mini'

// ❌ 나쁜 예: 코드를 그대로 반복
// model 변수에 gpt-4o-mini 할당
const model = 'gpt-4o-mini'
```

## 트러블슈팅

### Prisma Client 인식 안됨
```bash
npx prisma generate
```

### Tailwind 스타일 적용 안됨
- `app/globals.css`에 `@import "tailwindcss";` 있는지 확인
- Tailwind v4는 `@tailwind` 대신 `@import` 사용

### OpenAI API 에러
- `.env` 파일에 `OPENAI_API_KEY` 설정 확인
- API 키 유효성 확인

## 다음 구현 순서

1. **역량 대시보드** (`app/(student)/dashboard/page.tsx`)
   - 학생 조회
   - 역량 데이터 파싱
   - Recharts로 시각화

2. **CSV 업로드** (`app/(admin)/upload/page.tsx`)
   - 파일 업로드 폼
   - CSV 파싱
   - Student 테이블 저장

3. **과목 추천** (`app/api/recommend/route.ts`)
   - OpenAI API 호출
   - 추천 결과 저장
   - 프론트엔드 표시

4. **AI 튜터** (`app/api/chat/route.ts`)
   - 교안 텍스트 추출
   - 벡터 임베딩 (ChromaDB)
   - RAG 기반 답변

## 참고 자료

- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Prisma 가이드](https://www.prisma.io/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Recharts 예제](https://recharts.org/en-US/examples)
