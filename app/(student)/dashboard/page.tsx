'use client'

import { useEffect, useState } from 'react'
import { User, Lightbulb, Users, Target, BookOpen, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import CompetencyChart from '@/components/charts/CompetencyChart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

interface Student {
  id: number
  studentId: string
  name: string
  department: string | null
  grade: number | null
}

interface StudentDetail {
  id: number
  studentId: string
  name: string
  email: string | null
  department: string | null
  grade: number | null
  competencies: {
    creativity: number
    collaboration: number
    problemSolving: number
  }
  enrollments: Array<{
    semester: string
    grade: string | null
    course: {
      code: string
      name: string
      credits: number | null
    }
  }>
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null)
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
        setError('학생 목록을 불러올 수 없습니다.')
        toast.error('학생 목록을 불러올 수 없습니다.')
      })
  }, [])

  // 선택된 학생의 상세 정보 가져오기
  useEffect(() => {
    if (!selectedStudentId) return

    setLoading(true)
    setError(null)

    fetch(`/api/students/${selectedStudentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Student not found')
        return res.json()
      })
      .then((data) => {
        setStudentDetail(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch student detail:', err)
        setError('학생 정보를 불러올 수 없습니다.')
        toast.error('학생 정보를 불러올 수 없습니다.')
        setLoading(false)
      })
  }, [selectedStudentId])

  // 평균 점수 계산
  const averageScore = studentDetail
    ? Math.round(
        (studentDetail.competencies.creativity +
          studentDetail.competencies.collaboration +
          studentDetail.competencies.problemSolving) /
          3
      )
    : 0

  // 점수에 따른 Badge variant
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'success' as const, label: '우수' }
    if (score >= 60) return { variant: 'primary' as const, label: '양호' }
    if (score >= 40) return { variant: 'warning' as const, label: '보통' }
    return { variant: 'error' as const, label: '개선필요' }
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
        <h1 className="text-h2 sm:text-h1 text-[var(--foreground)] mb-2">역량 대시보드</h1>
        <p className="text-body text-[var(--foreground-muted)]">
          학습자의 핵심 역량을 분석하고 시각화합니다
        </p>
      </div>

      {/* 학생 선택 */}
      <Card variant="elevated">
        <CardContent className="p-6">
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
      {loading && <Loading size="lg" text="학생 정보를 불러오는 중..." />}

      {/* 학생 정보 및 역량 데이터 */}
      {!loading && studentDetail && (
        <>
          {/* 학생 기본 정보 카드 */}
          <Card variant="elevated">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-h3 sm:text-h2 text-[var(--foreground)]">
                      {studentDetail.name}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="neutral" size="sm">{studentDetail.studentId}</Badge>
                      {studentDetail.department && (
                        <Badge variant="neutral" size="sm">{studentDetail.department}</Badge>
                      )}
                      {studentDetail.grade && (
                        <Badge variant="neutral" size="sm">{studentDetail.grade}학년</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-caption text-[var(--foreground-muted)] mb-1">
                    종합 평균
                  </p>
                  <p className="text-h1 sm:text-display text-[var(--primary)]">{averageScore}</p>
                  <Badge
                    variant={getScoreBadge(averageScore).variant}
                    size="sm"
                    className="mt-2"
                  >
                    {getScoreBadge(averageScore).label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 역량 점수 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* 창의성 */}
            <Card variant="elevated" className="transition-all hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={getScoreBadge(studentDetail.competencies.creativity).variant}>
                    {getScoreBadge(studentDetail.competencies.creativity).label}
                  </Badge>
                </div>
                <h3 className="text-h4 text-[var(--foreground)] mb-1">창의성</h3>
                <p className="text-display text-[var(--primary)]">
                  {studentDetail.competencies.creativity}
                </p>
                <div className="mt-3 h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${studentDetail.competencies.creativity}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 협업능력 */}
            <Card variant="elevated" className="transition-all hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant={
                      getScoreBadge(studentDetail.competencies.collaboration).variant
                    }
                  >
                    {getScoreBadge(studentDetail.competencies.collaboration).label}
                  </Badge>
                </div>
                <h3 className="text-h4 text-[var(--foreground)] mb-1">협업능력</h3>
                <p className="text-display text-[var(--primary)]">
                  {studentDetail.competencies.collaboration}
                </p>
                <div className="mt-3 h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${studentDetail.competencies.collaboration}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 문제해결 */}
            <Card variant="elevated" className="transition-all hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant={
                      getScoreBadge(studentDetail.competencies.problemSolving).variant
                    }
                  >
                    {getScoreBadge(studentDetail.competencies.problemSolving).label}
                  </Badge>
                </div>
                <h3 className="text-h4 text-[var(--foreground)] mb-1">문제해결</h3>
                <p className="text-display text-[var(--primary)]">
                  {studentDetail.competencies.problemSolving}
                </p>
                <div className="mt-3 h-2 bg-[var(--gray-200)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                    style={{ width: `${studentDetail.competencies.problemSolving}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 레이더 차트 */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>역량 분석 차트</CardTitle>
            </CardHeader>
            <CardContent>
              <CompetencyChart data={studentDetail.competencies} />
            </CardContent>
          </Card>

          {/* 수강 이력 */}
          {studentDetail.enrollments.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>수강 이력</CardTitle>
                  <Badge variant="neutral">
                    {studentDetail.enrollments.length}개 과목
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="px-4 py-3 text-left text-label text-[var(--foreground)]">
                          학기
                        </th>
                        <th className="px-4 py-3 text-left text-label text-[var(--foreground)]">
                          과목코드
                        </th>
                        <th className="px-4 py-3 text-left text-label text-[var(--foreground)]">
                          과목명
                        </th>
                        <th className="px-4 py-3 text-left text-label text-[var(--foreground)]">
                          학점
                        </th>
                        <th className="px-4 py-3 text-left text-label text-[var(--foreground)]">
                          성적
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {studentDetail.enrollments.map((enrollment, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-[var(--surface-variant)] transition-colors"
                        >
                          <td className="px-4 py-3 text-body text-[var(--foreground)]">
                            {enrollment.semester}
                          </td>
                          <td className="px-4 py-3 text-body text-[var(--foreground-muted)]">
                            {enrollment.course.code}
                          </td>
                          <td className="px-4 py-3 text-body text-[var(--foreground)]">
                            {enrollment.course.name}
                          </td>
                          <td className="px-4 py-3 text-body text-[var(--foreground-muted)]">
                            {enrollment.course.credits}
                          </td>
                          <td className="px-4 py-3 text-label text-[var(--foreground)]">
                            {enrollment.grade || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
