'use client'

import { useState, useEffect } from 'react'
import { Sparkles, User, Lightbulb, Users, Target, BookOpen, TrendingUp, ChevronDown, ChevronUp, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'

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
  const [expandedReasons, setExpandedReasons] = useState<Set<number>>(new Set())

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
        toast.error('학생 목록을 불러올 수 없습니다.')
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
      toast.success('AI 추천이 완료되었습니다!')

      // Ollama 서버 미사용 시 알림
      if (data.note) {
        toast(data.note, { icon: 'ℹ️', duration: 5000 })
      }
    } catch (err) {
      setError('추천을 가져오는 중 오류가 발생했습니다.')
      toast.error('추천을 가져오는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 추천 사유 토글
  const toggleReason = (rank: number) => {
    setExpandedReasons((prev) => {
      const next = new Set(prev)
      if (next.has(rank)) {
        next.delete(rank)
      } else {
        next.add(rank)
      }
      return next
    })
  }

  // 매칭 점수 Badge variant
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'success' as const, label: '최적' }
    if (score >= 70) return { variant: 'primary' as const, label: '우수' }
    if (score >= 60) return { variant: 'warning' as const, label: '양호' }
    return { variant: 'neutral' as const, label: '보통' }
  }

  // 랭크별 색상
  const getRankColor = (rank: number) => {
    const colors = [
      'from-yellow-500 to-yellow-600', // 1위 - 금색
      'from-gray-400 to-gray-500', // 2위 - 은색
      'from-orange-600 to-orange-700', // 3위 - 동색
      'from-blue-500 to-blue-600', // 4위
      'from-purple-500 to-purple-600', // 5위
    ]
    return colors[rank - 1] || 'from-gray-400 to-gray-500'
  }

  // 데이터 없음
  if (!loading && students.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="등록된 학생 데이터가 없습니다"
        description="CSV 파일을 업로드하여 학생 데이터를 추가해주세요"
        action={{
          label: '학생 데이터 업로드하기',
          onClick: () => (window.location.href = '/upload'),
          icon: TrendingUp,
        }}
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-h2 sm:text-h1 text-[var(--foreground)] mb-2">AI 과목 추천</h1>
        <p className="text-body text-[var(--foreground-muted)]">
          AI가 당신의 역량에 맞는 최적의 과목을 추천해드립니다
        </p>
      </div>

      {/* 학생 선택 및 추천 요청 */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                label="학생 선택"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                options={students.map((s) => ({
                  value: s.studentId,
                  label: `${s.studentId} - ${s.name}${
                    s.department ? ` (${s.department})` : ''
                  }`,
                }))}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGetRecommendations}
                disabled={!selectedStudentId || loading}
                loading={loading}
                leftIcon={<Sparkles className="h-4 w-4" />}
                size="lg"
              >
                AI 추천 받기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {error && (
        <Card variant="outlined" className="border-[var(--error)]">
          <CardContent className="p-4 bg-[var(--error-light)]">
            <p className="text-body text-[var(--error)]">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 로딩 */}
      {loading && <Loading size="lg" text="AI가 최적의 과목을 분석하고 있습니다..." />}

      {/* 추천 결과 */}
      {!loading && result && (
        <>
          {/* 학생 역량 정보 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{result.student.name}님의 역량 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* 창의성 */}
                <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-[var(--surface-variant)]">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-caption text-[var(--foreground-muted)]">창의성</p>
                    <p className="text-h3 text-[var(--primary)]">
                      {result.student.competencies.creativity}
                    </p>
                  </div>
                </div>

                {/* 협업능력 */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-variant)]">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-caption text-[var(--foreground-muted)]">협업능력</p>
                    <p className="text-h3 text-[var(--primary)]">
                      {result.student.competencies.collaboration}
                    </p>
                  </div>
                </div>

                {/* 문제해결 */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-variant)]">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-caption text-[var(--foreground-muted)]">문제해결</p>
                    <p className="text-h3 text-[var(--primary)]">
                      {result.student.competencies.problemSolving}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 경고 메시지 (Ollama 메시지) */}
          {result.note && (
            <Card variant="outlined" className="border-[var(--warning)]">
              <CardContent className="p-4 bg-[var(--warning-light)]">
                <div className="flex gap-2">
                  <span className="text-[var(--warning)]">ℹ️</span>
                  <p className="text-body text-[var(--warning)]">{result.note}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 추천 과목 타이틀 */}
          <div className="flex items-center justify-between">
            <h2 className="text-h2 text-[var(--foreground)]">추천 과목</h2>
            <Badge variant="primary" size="lg">
              <Award className="h-3 w-3" />
              Top 5
            </Badge>
          </div>

          {/* 추천 과목 그리드 */}
          <div className="grid grid-cols-1 gap-4">
            {result.recommendations.map((rec) => (
              <Card
                key={rec.rank}
                variant="elevated"
                className="transition-all hover:scale-[1.01]"
              >
                <CardContent className="p-4 sm:p-6">
                  {/* 헤더 */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      {/* 랭크 뱃지 */}
                      <div
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br ${getRankColor(rec.rank)} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-lg sm:text-xl font-bold text-white">{rec.rank}</span>
                      </div>

                      {/* 과목 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-h4 sm:text-h3 text-[var(--foreground)] mb-2">
                          {rec.course.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="neutral" size="sm">
                            {rec.course.code}
                          </Badge>
                          {rec.course.department && (
                            <Badge variant="neutral" size="sm">
                              {rec.course.department}
                            </Badge>
                          )}
                          {rec.course.credits && (
                            <Badge variant="neutral" size="sm">
                              {rec.course.credits}학점
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 매칭 점수 */}
                    <div className="text-center sm:text-right flex-shrink-0 sm:ml-4">
                      <p className="text-caption text-[var(--foreground-muted)] mb-1">
                        매칭도
                      </p>
                      <p className="text-h2 text-[var(--primary)] mb-1">
                        {rec.matchScore.toFixed(1)}%
                      </p>
                      <Badge
                        variant={getScoreBadge(rec.matchScore).variant}
                        size="sm"
                      >
                        {getScoreBadge(rec.matchScore).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getRankColor(rec.rank)} transition-all duration-500`}
                        style={{ width: `${rec.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* 과목 설명 */}
                  {rec.course.description && (
                    <p className="text-body text-[var(--foreground-muted)] mb-4">
                      {rec.course.description}
                    </p>
                  )}

                  {/* AI 추천 사유 (Expandable) */}
                  <div className="border-t border-[var(--border)] pt-4">
                    <button
                      onClick={() => toggleReason(rec.rank)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-variant)] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                        <span className="text-label text-[var(--foreground)]">
                          AI 추천 사유
                        </span>
                      </div>
                      {expandedReasons.has(rec.rank) ? (
                        <ChevronUp className="h-4 w-4 text-[var(--foreground-muted)]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[var(--foreground-muted)]" />
                      )}
                    </button>

                    {expandedReasons.has(rec.rank) && (
                      <div className="mt-3 p-4 bg-[var(--primary-light)] rounded-lg border-l-4 border-[var(--primary)] animate-scale-in">
                        <p className="text-body text-[var(--foreground)]">
                          {rec.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
