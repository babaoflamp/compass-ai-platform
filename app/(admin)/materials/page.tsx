'use client'

import { useState, useEffect } from 'react'

interface Course {
  id: number
  code: string
  name: string
}

interface Material {
  id: number
  title: string
  filename: string
  createdAt: string
}

export default function MaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])

  // 과목 목록 로드 (실제로는 API 호출 필요)
  useEffect(() => {
    // 하드코딩된 과목 목록
    setCourses([
      { id: 1, code: 'CS101', name: '프로그래밍 기초' },
      { id: 2, code: 'CS201', name: '자료구조' },
      { id: 3, code: 'CS301', name: '데이터베이스 시스템' },
      { id: 4, code: 'DES101', name: '창의적 사고와 디자인' },
      { id: 5, code: 'DES202', name: 'UI/UX 디자인' },
      { id: 6, code: 'BUS101', name: '경영학 원론' },
      { id: 7, code: 'BUS202', name: '프로젝트 관리' },
      { id: 8, code: 'ENG101', name: '공학설계 입문' },
      { id: 9, code: 'AI301', name: '인공지능 개론' },
      { id: 10, code: 'TEAM101', name: '팀워크와 리더십' },
    ])
  }, [])

  // 교안 업로드
  const handleUpload = async () => {
    if (!selectedCourseId || !title || !content) {
      setResult({
        success: false,
        message: '모든 필드를 입력해주세요.',
      })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title,
          content,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: '교안이 성공적으로 업로드되었습니다!',
        })
        setTitle('')
        setContent('')
        // 목록 새로고침
        if (selectedCourseId) {
          loadMaterials(selectedCourseId)
        }
      } else {
        setResult({
          success: false,
          message: data.error || '업로드에 실패했습니다.',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: '업로드 중 오류가 발생했습니다.',
      })
    } finally {
      setUploading(false)
    }
  }

  // 과목별 교안 목록 로드
  const loadMaterials = async (courseId: string) => {
    try {
      const response = await fetch(`/api/materials?courseId=${courseId}`)
      const data = await response.json()
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Failed to load materials:', error)
    }
  }

  // 과목 선택 시 교안 목록 로드
  useEffect(() => {
    if (selectedCourseId) {
      loadMaterials(selectedCourseId)
    } else {
      setMaterials([])
    }
  }, [selectedCourseId])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 교안 관리</h1>
          <p className="text-gray-600">AI 튜터가 사용할 교안을 업로드하고 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 업로드 폼 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">교안 업로드</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과목 선택
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">과목을 선택하세요</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  교안 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 1주차 - 프로그래밍 기초"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  교안 내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="교안 내용을 입력하세요..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 텍스트 형식으로 입력하세요. AI 튜터는 이 내용을 참고하여 답변합니다.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !selectedCourseId || !title || !content}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  uploading || !selectedCourseId || !title || !content
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? '업로드 중...' : '교안 업로드'}
              </button>

              {/* 결과 메시지 */}
              {result && (
                <div
                  className={`rounded-lg p-4 ${
                    result.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {result.message}
                </div>
              )}
            </div>
          </div>

          {/* 교안 목록 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">등록된 교안</h2>

            {!selectedCourseId && (
              <div className="text-center text-gray-500 py-12">
                <p>과목을 선택하면 교안 목록이 표시됩니다</p>
              </div>
            )}

            {selectedCourseId && materials.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <p>등록된 교안이 없습니다</p>
              </div>
            )}

            {materials.length > 0 && (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{material.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(material.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">{material.filename}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 샘플 교안 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📝 교안 작성 팁
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 명확하고 구조화된 형식으로 작성하세요</li>
            <li>• 주요 개념, 정의, 예시를 포함하세요</li>
            <li>• 학생들이 자주 묻는 질문을 예상하여 작성하세요</li>
            <li>• 코드 예제가 있다면 주석과 함께 작성하세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
