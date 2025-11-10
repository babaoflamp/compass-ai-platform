'use client'

import { useEffect, useState } from 'react'
import CompetencyChart from '@/components/charts/CompetencyChart'
import CompetencyScoreCard from '@/components/CompetencyScoreCard'

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
        // 첫 번째 학생 자동 선택
        if (data.students.length > 0) {
          setSelectedStudentId(data.students[0].studentId)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch students:', err)
        setError('학생 목록을 불러올 수 없습니다.')
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 역량 대시보드</h1>
          <p className="text-gray-600">학습자의 핵심 역량을 분석하고 시각화합니다</p>
        </div>

        {/* 학생 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학생 선택
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {students.map((student) => (
              <option key={student.id} value={student.studentId}>
                {student.studentId} - {student.name}
                {student.department && ` (${student.department})`}
              </option>
            ))}
          </select>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* 학생 정보 및 역량 데이터 */}
        {!loading && studentDetail && (
          <>
            {/* 학생 기본 정보 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {studentDetail.name}
                  </h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>학번: {studentDetail.studentId}</span>
                    {studentDetail.department && (
                      <span>학과: {studentDetail.department}</span>
                    )}
                    {studentDetail.grade && <span>{studentDetail.grade}학년</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">종합 평균</div>
                  <div className="text-4xl font-bold text-blue-600">
                    {averageScore}점
                  </div>
                </div>
              </div>
            </div>

            {/* 역량 점수 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <CompetencyScoreCard
                label="창의성"
                score={studentDetail.competencies.creativity}
                icon="💡"
              />
              <CompetencyScoreCard
                label="협업능력"
                score={studentDetail.competencies.collaboration}
                icon="🤝"
              />
              <CompetencyScoreCard
                label="문제해결"
                score={studentDetail.competencies.problemSolving}
                icon="🎯"
              />
            </div>

            {/* 레이더 차트 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                역량 분석 차트
              </h3>
              <CompetencyChart data={studentDetail.competencies} />
            </div>

            {/* 수강 과목 */}
            {studentDetail.enrollments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  수강 이력
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          학기
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          과목코드
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          과목명
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          학점
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          성적
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {studentDetail.enrollments.map((enrollment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {enrollment.semester}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {enrollment.course.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {enrollment.course.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {enrollment.course.credits}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {enrollment.grade || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* 데이터 없음 */}
        {!loading && students.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800 mb-4">
              등록된 학생 데이터가 없습니다.
            </p>
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
