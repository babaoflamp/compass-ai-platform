'use client'

import { useState, useEffect } from 'react'

interface Student {
  id: number
  studentId: string
  name: string
  department: string | null
  grade: number | null
}

interface Recommendation {
  rank: number
  course: {
    code: string
    name: string
    description: string | null
    credits: number | null
    department: string | null
  }
  matchScore: number
  reason: string
}

interface RecommendationResponse {
  student: {
    name: string
    studentId: string
    competencies: {
      creativity: number
      collaboration: number
      problemSolving: number
    }
  }
  recommendations: Recommendation[]
  note?: string
}

export default function AdvisorPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [result, setResult] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 학생 목록 가져오기
  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students)
        if (data.students.length > 0) {
          setSelectedStudentId(data.students[0].studentId)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch students:', err)
      })
  }, [])

  // AI 추천 요청
  const handleGetRecommendations = async () => {
    if (!selectedStudentId) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: selectedStudentId }),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('추천을 가져오는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 매칭 점수 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300'
    if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 AI 어드바이저
          </h1>
          <p className="text-gray-600">
            AI가 당신의 역량에 맞는 최적의 과목을 추천해드립니다
          </p>
        </div>

        {/* 학생 선택 및 추천 요청 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 선택
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.studentId}>
                    {student.studentId} - {student.name}
                    {student.department && ` (${student.department})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGetRecommendations}
                disabled={!selectedStudentId || loading}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  !selectedStudentId || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? '분석 중...' : 'AI 추천 받기'}
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              AI가 최적의 과목을 분석하고 있습니다...
            </p>
          </div>
        )}

        {/* 추천 결과 */}
        {!loading && result && (
          <>
            {/* 학생 정보 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {result.student.name}님의 역량 분석
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">💡 창의성</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.student.competencies.creativity}점
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">🤝 협업능력</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.student.competencies.collaboration}점
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">🎯 문제해결</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.student.competencies.problemSolving}점
                  </div>
                </div>
              </div>
            </div>

            {/* 경고 메시지 (OpenAI 키 없을 때) */}
            {result.note && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
                ℹ️ {result.note}
              </div>
            )}

            {/* 추천 과목 리스트 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                추천 과목 (Top 5)
              </h2>

              {result.recommendations.map((rec) => (
                <div
                  key={rec.rank}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {rec.rank}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {rec.course.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {rec.course.code} · {rec.course.department} ·{' '}
                          {rec.course.credits}학점
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full border font-semibold text-sm ${getScoreBadgeColor(rec.matchScore)}`}
                    >
                      매칭 {rec.matchScore.toFixed(1)}%
                    </div>
                  </div>

                  {rec.course.description && (
                    <p className="text-gray-700 mb-4">
                      {rec.course.description}
                    </p>
                  )}

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">💡</span>
                      <div>
                        <div className="text-sm font-semibold text-blue-900 mb-1">
                          AI 추천 사유
                        </div>
                        <p className="text-sm text-blue-800">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 데이터 없음 */}
        {!loading && !result && students.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800 mb-4">등록된 학생 데이터가 없습니다.</p>
            <a
              href="/upload"
              className="inline-block px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              학생 데이터 업로드하기
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
