# 🧭 COMPASS

**C**ompetency **O**riented **M**entoring **P**latform with **A**I **S**upport **S**ystem

AI 기반 역량 관리 및 학습 지원 통합 플랫폼

---

## 📖 프로젝트 개요

COMPASS는 대학교 학습자와 교수자를 위한 AI 기반 학습 지원 플랫폼입니다.

### 핵심 기능

1. **📊 역량 대시보드** - 학습자의 핵심 역량 시각화
2. **🎯 AI 어드바이저** - 역량 기반 맞춤형 과목 추천
3. **💬 AI 튜터** - 교안 기반 질의응답 (RAG)
4. **⚙️ 관리자 시스템** - 데이터 업로드 및 사용 통계

---

## 🚀 빠른 시작

### 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- OpenAI API Key

### 설치

```bash
# 1. 저장소 클론
git clone <repository-url>
cd compass-ai-platform

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정

# 4. 데이터베이스 초기화 (이미 완료됨)
npx prisma migrate dev

# 5. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📁 프로젝트 구조

```
compass-ai-platform/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 페이지
│   │   └── login/
│   ├── (student)/           # 학생용 페이지
│   │   ├── dashboard/       # 역량 대시보드
│   │   ├── advisor/         # AI 과목 추천
│   │   └── tutor/           # AI 튜터 채팅
│   ├── (admin)/             # 관리자 페이지
│   │   ├── upload/          # 데이터 업로드
│   │   └── analytics/       # 통계 대시보드
│   ├── api/                 # API Routes
│   │   ├── chat/           # 튜터 채팅 API
│   │   ├── recommend/      # 과목 추천 API
│   │   └── upload/         # 파일 업로드 API
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/              # React 컴포넌트
│   ├── ui/                 # 공통 UI 컴포넌트
│   └── charts/             # 차트 컴포넌트
├── lib/                     # 유틸리티 라이브러리
│   ├── db.ts               # Prisma 클라이언트
│   └── openai.ts           # OpenAI 클라이언트
├── prisma/                  # Prisma 스키마
│   ├── schema.prisma
│   ├── migrations/
│   └── dev.db              # SQLite 데이터베이스
├── public/                  # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🛠️ 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite (개발), PostgreSQL (프로덕션) |
| ORM | Prisma |
| AI/LLM | OpenAI API (GPT-4o-mini) |
| Charts | Recharts |
| Deployment | Vercel (권장) |

---

## 💾 데이터베이스 스키마

### 주요 테이블

- **Student** - 학생 정보 및 역량 데이터
- **Course** - 과목 정보
- **CourseEnrollment** - 수강 정보
- **CourseMaterial** - 교안/교재 자료
- **ChatLog** - AI 튜터 대화 기록
- **Recommendation** - AI 추천 기록
- **UsageStats** - API 사용 통계

상세 스키마는 `prisma/schema.prisma` 참조

---

## 🔑 환경 변수

```env
# .env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-your-api-key-here"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📝 개발 가이드

### 스크립트

```bash
npm run dev      # 개발 서버 시작 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

### Prisma 명령어

```bash
npx prisma studio           # 데이터베이스 GUI 열기
npx prisma migrate dev      # 새 마이그레이션 생성
npx prisma generate         # Prisma Client 재생성
npx prisma db push          # 스키마를 DB에 직접 푸시 (프로토타입용)
```

### 데이터베이스 시드 (예정)

```bash
npx prisma db seed
```

---

## 🎯 MVP 개발 로드맵

### ✅ Phase 0: 프로젝트 셋업 (완료)
- [x] Next.js 프로젝트 생성
- [x] Prisma + SQLite 설정
- [x] 기본 디렉토리 구조
- [x] OpenAI API 연동 준비

### 🚧 Phase 1: 핵심 기능 (진행 중)
- [ ] 학생 역량 대시보드 UI
- [ ] CSV 데이터 업로드 기능
- [ ] 역량 시각화 차트

### 📅 Phase 2: AI 기능
- [ ] OpenAI 기반 과목 추천 API
- [ ] RAG 기반 AI 튜터 채팅
- [ ] 교안 PDF 파싱 및 임베딩

### 📅 Phase 3: 관리 기능
- [ ] 사용 통계 대시보드
- [ ] 토큰 사용량 모니터링
- [ ] 관리자 인증

---

## 🔐 보안 고려사항

- **환경 변수**: `.env` 파일은 절대 커밋하지 마세요
- **API 키**: OpenAI API 키는 서버 사이드에서만 사용
- **학생 데이터**: 개인정보보호법 준수 필요
- **인증**: NextAuth.js 또는 학교 SSO 연동 예정

---

## 📊 비용 예상 (MVP)

### OpenAI API 비용 (GPT-4o-mini)
- 입력: $0.150 / 1M 토큰
- 출력: $0.600 / 1M 토큰

**예상 사용량** (학생 100명, 월간):
- 과목 추천: 100 요청 × 500 토큰 = 50,000 토큰 → **$0.03**
- AI 튜터: 500 대화 × 1,000 토큰 = 500,000 토큰 → **$0.38**
- **월 총액: ~$0.50**

### 호스팅 비용
- **Vercel Hobby**: 무료 (개인/학교 프로젝트)
- **Vercel Pro**: $20/월 (상용)

---

## 🤝 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License

---

## 📞 문의

프로젝트 관련 문의: [이메일 주소]

---

## 🙏 감사

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [OpenAI](https://openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

**Version**: 0.1.0 (MVP)
**Last Updated**: 2025-11-10
