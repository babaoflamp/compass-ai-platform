'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, User as UserIcon, Send, BookOpen, Info, TrendingUp, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/ui/EmptyState'

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
      .catch((err) => {
        console.error('Failed to fetch students:', err)
        toast.error('학생 목록을 불러올 수 없습니다.')
      })
  }, [])

  // 과목 목록 가져오기
  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data)
      })
      .catch((err) => {
        console.error('Failed to fetch courses:', err)
        toast.error('과목 목록을 불러올 수 없습니다.')
      })
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
      toast.error('질문 전송에 실패했습니다.')
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

  // 신뢰도 Badge
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { variant: 'success' as const, label: '높음' }
    if (confidence >= 60) return { variant: 'primary' as const, label: '중간' }
    return { variant: 'warning' as const, label: '낮음' }
  }

  // 데이터 없음
  if (students.length === 0) {
    return (
      <EmptyState
        icon={UserIcon}
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-h2 sm:text-h1 text-[var(--foreground)] mb-2">AI 튜터</h1>
        <p className="text-body text-[var(--foreground-muted)]">
          AI 튜터에게 학습 질문을 하고 답변을 받아보세요
        </p>
      </div>

      {/* 설정 */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="학생 선택"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              options={students.map((s) => ({
                value: s.studentId,
                label: `${s.name} (${s.studentId})`,
              }))}
            />
            <Select
              label="과목 선택 (선택사항)"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={[
                { value: '', label: '전체 과목' },
                ...courses.map((c) => ({
                  value: c.id.toString(),
                  label: `${c.code} - ${c.name}`,
                })),
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* 채팅 영역 */}
      <Card variant="elevated" className="flex-1 flex flex-col overflow-hidden">
        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-h3 text-[var(--foreground)] mb-2">
                  AI 튜터에게 질문해보세요!
                </h3>
                <p className="text-body text-[var(--foreground-muted)]">
                  예: "선형회귀와 로지스틱 회귀의 차이는 무엇인가요?"
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {/* Avatar */}
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[80%] md:max-w-[75%] rounded-2xl p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface-variant)] text-[var(--foreground)]'
                }`}
              >
                <div className="whitespace-pre-wrap text-body">{message.content}</div>

                {/* AI 답변의 출처 및 신뢰도 */}
                {message.role === 'assistant' &&
                  (message.sources?.length ?? 0) > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-[var(--primary)]" />
                        <span className="text-label text-[var(--foreground)]">
                          참고 자료 ({message.sources?.length}개)
                        </span>
                      </div>
                      <div className="space-y-1">
                        {message.sources?.map((source, idx) => (
                          <div
                            key={idx}
                            className="text-caption text-[var(--foreground-muted)] pl-6"
                          >
                            • {source.title}
                          </div>
                        ))}
                      </div>
                      {message.confidence !== undefined && (
                        <div className="flex items-center gap-2 mt-3">
                          <Info className="h-3 w-3 text-[var(--foreground-muted)]" />
                          <span className="text-caption text-[var(--foreground-muted)]">
                            신뢰도:
                          </span>
                          <Badge
                            variant={getConfidenceBadge(message.confidence).variant}
                            size="sm"
                          >
                            {message.confidence}% (
                            {getConfidenceBadge(message.confidence).label})
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* User Avatar */}
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-[var(--surface-variant)] rounded-2xl p-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)]">
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="질문을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
              rows={2}
              disabled={loading || !selectedStudentId}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || !selectedStudentId}
              loading={loading}
              leftIcon={<Send className="h-4 w-4" />}
              size="lg"
              className="shrink-0"
            >
              전송
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Sparkles className="h-3 w-3 text-[var(--primary)]" />
            <p className="text-caption text-[var(--foreground-muted)]">
              교안에 기반한 답변을 제공합니다. 교안에 없는 내용은 답변할 수 없습니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
