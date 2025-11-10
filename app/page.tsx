import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center space-y-8 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">
            🧭 COMPASS
          </h1>
          <p className="text-2xl text-gray-600">
            Competency Oriented Mentoring Platform with AI Support System
          </p>
          <p className="text-lg text-gray-500">
            학습자를 위한 AI 기반 역량 관리 및 학습 지원 통합 플랫폼
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Link
            href="/dashboard"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📊 역량 대시보드</h2>
            <p className="text-gray-600">나의 핵심 역량 분석 확인</p>
          </Link>

          <Link
            href="/advisor"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">🎯 AI 어드바이저</h2>
            <p className="text-gray-600">맞춤형 과목 추천</p>
          </Link>

          <Link
            href="/tutor"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">💬 AI 튜터</h2>
            <p className="text-gray-600">학습 질문과 답변</p>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">관리자 메뉴</h3>
          <div className="flex gap-4 justify-center">
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-purple-700 transition-all"
            >
              <h2 className="text-base font-semibold mb-1">⚙️ 데이터 업로드</h2>
              <p className="text-xs text-purple-100">학생 데이터 CSV</p>
            </Link>
            <Link
              href="/materials"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all"
            >
              <h2 className="text-base font-semibold mb-1">📚 교안 관리</h2>
              <p className="text-xs text-indigo-100">AI 튜터용 교안</p>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Version 0.1.0 (MVP) - Built with Next.js 15 + TypeScript
          </p>
        </div>
      </main>
    </div>
  );
}
