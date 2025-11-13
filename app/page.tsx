import Link from "next/link";
import { LayoutDashboard, GraduationCap, MessageCircle, Upload, FileText, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--primary-light)] to-[var(--background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32">
          <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge variant="primary" size="lg">
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">AI 기반 학습 지원 플랫폼</span>
                <span className="sm:hidden">AI 학습 플랫폼</span>
              </Badge>
            </div>

            {/* Heading */}
            <h1 className="text-h1 sm:text-display text-[var(--foreground)] max-w-4xl mx-auto px-4">
              COMPASS와 함께하는
              <br />
              <span className="text-[var(--primary)]">맞춤형 학습 여정</span>
            </h1>

            {/* Description */}
            <p className="text-body sm:text-body-lg text-[var(--foreground-muted)] max-w-2xl mx-auto px-4">
              Competency Oriented Mentoring Platform with AI Support System
              <br className="hidden sm:block" />
              <span className="sm:hidden">- </span>
              역량 기반 멘토링과 AI 튜터로 당신의 학습을 더욱 효과적으로 만들어보세요
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/dashboard">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  시작하기
                </Button>
              </Link>
              <Link href="/tutor">
                <Button size="lg" variant="outline">
                  AI 튜터 체험하기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] opacity-5 rounded-full blur-3xl -z-10" />
        <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-[var(--info)] opacity-5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section - Student */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-h2 text-[var(--foreground)] mb-3">학습자 기능</h2>
          <p className="text-body text-[var(--foreground-muted)] px-4">
            AI 기반 역량 분석과 맞춤형 학습 지원을 경험하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <Card variant="elevated" className="h-full transition-all hover:scale-[1.02]">
              <div className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-h3 text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                    역량 대시보드
                  </h3>
                  <p className="text-body text-[var(--foreground-muted)]">
                    창의력, 협업능력, 문제해결력 등 핵심 역량을 한눈에 확인하고 분석하세요
                  </p>
                </div>
                <div className="flex items-center text-[var(--primary)] text-sm font-medium pt-2">
                  대시보드 보기
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Advisor Card */}
          <Link href="/advisor" className="group">
            <Card variant="elevated" className="h-full transition-all hover:scale-[1.02]">
              <div className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-h3 text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                    AI 과목 추천
                  </h3>
                  <p className="text-body text-[var(--foreground-muted)]">
                    당신의 역량 수준을 분석해 최적의 수강 과목을 AI가 추천해드립니다
                  </p>
                </div>
                <div className="flex items-center text-[var(--primary)] text-sm font-medium pt-2">
                  추천 받기
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Tutor Card */}
          <Link href="/tutor" className="group">
            <Card variant="elevated" className="h-full transition-all hover:scale-[1.02]">
              <div className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-h3 text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                    AI 튜터
                  </h3>
                  <p className="text-body text-[var(--foreground-muted)]">
                    학습 자료 기반 RAG 시스템으로 정확한 답변과 학습 도움을 받으세요
                  </p>
                </div>
                <div className="flex items-center text-[var(--primary)] text-sm font-medium pt-2">
                  질문하기
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Admin Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-[var(--surface-variant)] rounded-2xl p-6 sm:p-8 md:p-12 border border-[var(--border)]">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-h2 text-[var(--foreground)] mb-3">관리자 도구</h2>
            <p className="text-body text-[var(--foreground-muted)] px-4">
              학습 데이터와 교육 자료를 효율적으로 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {/* Upload Card */}
            <Link href="/upload" className="group">
              <Card variant="interactive" className="h-full">
                <div className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h4 text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                      데이터 업로드
                    </h3>
                    <p className="text-body text-[var(--foreground-muted)]">
                      학생 정보 CSV 파일 업로드
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--foreground-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>

            {/* Materials Card */}
            <Link href="/materials" className="group">
              <Card variant="interactive" className="h-full">
                <div className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h4 text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                      학습 자료 관리
                    </h3>
                    <p className="text-body text-[var(--foreground-muted)]">
                      AI 튜터용 교육 자료 관리
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--foreground-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-label text-[var(--foreground)]">COMPASS</span>
            </div>
            <p className="text-caption text-[var(--foreground-muted)] text-center">
              <span className="hidden sm:inline">Version 0.1.0 (MVP) - Built with Next.js 15 + TypeScript + Ollama</span>
              <span className="sm:hidden">v0.1.0 (MVP)</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
