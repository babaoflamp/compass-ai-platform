'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ title: string; excerpt: string }>
  confidence?: number
}

interface Student {
  id: number
  studentId: string
  name: string
}

interface Course {
  id: number
  code: string
  name: string
}

export default function TutorPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      .catch((err) => console.error('Failed to fetch students:', err))
  }, [])

  // 과목 목록 가져오기 (seed 데이터)
  useEffect(() => {
    fetch('/api/students') // 임시로 students API 사용
      .then(() => {
        // 하드코딩된 과목 목록 (실제로는 별도 API 필요)
        setCourses([
          { id: 1, code: 'CS101', name: '프로그래밍 기초' },
          { id: 2, code: 'CS201', name: '자료구조' },
          { id: 3, code: 'CS301', name: '데이터베이스 시스템' },
        ])
      })
      .catch((err) => console.error('Failed to fetch courses:', err))
  }, [])

  // 질문 전송
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedStudentId || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          courseId: selectedCourseId || null,
          question: input,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        confidence: data.confidence,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '죄송합니다. 오류가 발생했습니다.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 AI 튜터</h1>
          <p className="text-gray-600">
            AI 튜터에게 학습 질문을 하고 답변을 받아보세요
          </p>
        </div>

        {/* 설정 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 선택
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.studentId}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                과목 선택 (선택사항)
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 과목</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg">AI 튜터에게 질문해보세요!</p>
                <p className="text-sm mt-2">
                  예: "선형회귀와 로지스틱 회귀의 차이는 무엇인가요?"
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* AI 답변의 출처 및 신뢰도 */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-600 mb-2">
                        📚 참고 자료 ({message.sources.length}개)
                      </div>
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-gray-700 mb-1">
                          • {source.title}
                        </div>
                      ))}
                      {message.confidence !== undefined && (
                        <div className="text-xs text-gray-600 mt-2">
                          신뢰도: {message.confidence}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="질문을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={loading || !selectedStudentId}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading || !selectedStudentId}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  !input.trim() || loading || !selectedStudentId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                전송
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              💡 교안에 기반한 답변을 제공합니다. 교안에 없는 내용은 답변할 수 없습니다.
            </div>
          </div>
        </div>

        {/* 데이터 없음 경고 */}
        {students.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800">
              등록된 학생이 없습니다. 먼저 학생 데이터를 업로드하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
