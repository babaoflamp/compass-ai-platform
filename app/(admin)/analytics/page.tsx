'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Users,
  BookOpen,
  Activity,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  usageStats: Array<{
    date: string
    apiCalls: number
    tokensUsed: number
    chatCount: number
    recommendCount: number
    estimatedCost: number
  }>
  totalStats: {
    totalApiCalls: number
    totalTokens: number
    totalChats: number
    totalRecommendations: number
  }
  studentActivity: Array<{
    studentId: string
    name: string
    chatCount: number
    recommendationCount: number
  }>
  courseActivity: Array<{
    code: string
    name: string
    materialCount: number
    recommendationCount: number
  }>
  recentChats: Array<{
    id: number
    question: string
    confidence: number | null
    createdAt: string
    student: {
      studentId: string
      name: string
    }
  }>
  recentRecommendations: Array<{
    id: number
    score: number
    status: string
    createdAt: string
    student: {
      studentId: string
      name: string
    }
    course: {
      code: string
      name: string
    }
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch analytics:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <Loading size="lg" text="통계 데이터를 불러오는 중..." />
  }

  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="통계 데이터를 불러올 수 없습니다"
        description="잠시 후 다시 시도해주세요"
      />
    )
  }

  const { totalStats, usageStats, studentActivity, courseActivity, recentChats, recentRecommendations } = data

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 상대 시간 표시
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${diffDays}일 전`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-(--foreground) mb-2">사용 통계</h1>
        <p className="text-body text-(--foreground-muted)">
          AI 시스템 사용 현황 및 활동 통계를 확인하세요
        </p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-h2 text-(--foreground) mb-1">
              {totalStats.totalApiCalls.toLocaleString()}
            </div>
            <div className="text-caption text-(--foreground-muted)">총 API 호출</div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-h2 text-(--foreground) mb-1">
              {totalStats.totalTokens.toLocaleString()}
            </div>
            <div className="text-caption text-(--foreground-muted)">총 토큰 사용량</div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-h2 text-(--foreground) mb-1">
              {totalStats.totalChats.toLocaleString()}
            </div>
            <div className="text-caption text-(--foreground-muted)">AI 튜터 질문</div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-h2 text-(--foreground) mb-1">
              {totalStats.totalRecommendations.toLocaleString()}
            </div>
            <div className="text-caption text-(--foreground-muted)">과목 추천</div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API 사용량 추이 */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>API 사용량 추이 (최근 30일)</CardTitle>
          </CardHeader>
          <CardContent>
            {usageStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="var(--foreground-muted)"
                  />
                  <YAxis stroke="var(--foreground-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="apiCalls"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="API 호출"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-(--foreground-muted)">
                데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* 기능별 사용량 */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>기능별 사용량 (최근 30일)</CardTitle>
          </CardHeader>
          <CardContent>
            {usageStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="var(--foreground-muted)"
                  />
                  <YAxis stroke="var(--foreground-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="chatCount" fill="#10b981" name="AI 튜터" />
                  <Bar dataKey="recommendCount" fill="#f59e0b" name="과목 추천" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-(--foreground-muted)">
                데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 활동 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 학생별 활동 */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-(--primary)" />
              활동적인 학생 (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentActivity.length > 0 ? (
              <div className="space-y-3">
                {studentActivity.map((student, index) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-3 rounded-lg bg-(--surface-variant)"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-label font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-body font-medium text-(--foreground)">
                          {student.name}
                        </div>
                        <div className="text-caption text-(--foreground-muted)">
                          {student.studentId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        채팅 {student.chatCount}
                      </Badge>
                      <Badge variant="warning" size="sm">
                        추천 {student.recommendationCount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-(--foreground-muted)">
                활동 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* 과목별 활동 */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-(--primary)" />
              인기 과목 (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseActivity.length > 0 ? (
              <div className="space-y-3">
                {courseActivity.map((course, index) => (
                  <div
                    key={course.code}
                    className="flex items-center justify-between p-3 rounded-lg bg-(--surface-variant)"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-label font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-body font-medium text-(--foreground)">
                          {course.name}
                        </div>
                        <div className="text-caption text-(--foreground-muted)">
                          {course.code}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        교안 {course.materialCount}
                      </Badge>
                      <Badge variant="warning" size="sm">
                        추천 {course.recommendationCount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-(--foreground-muted)">
                과목 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 채팅 */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-(--primary)" />
              최근 AI 튜터 질문
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 rounded-lg bg-(--surface-variant) border border-(--border)"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-body text-(--foreground) mb-1">
                          {chat.question}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-caption text-(--foreground-muted)">
                            {chat.student.name}
                          </span>
                          {chat.confidence !== null && (
                            <Badge
                              variant={
                                chat.confidence >= 80
                                  ? 'success'
                                  : chat.confidence >= 60
                                  ? 'primary'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              신뢰도 {chat.confidence}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-caption text-(--foreground-muted) ml-2">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(chat.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-(--foreground-muted)">
                채팅 기록이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 추천 */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-(--primary)" />
              최근 과목 추천
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRecommendations.length > 0 ? (
              <div className="space-y-3">
                {recentRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg bg-(--surface-variant) border border-(--border)"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-body font-medium text-(--foreground) mb-1">
                          {rec.course.name} ({rec.course.code})
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-caption text-(--foreground-muted)">
                            {rec.student.name}
                          </span>
                          <Badge
                            variant={
                              rec.status === 'approved'
                                ? 'success'
                                : rec.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {rec.status === 'approved'
                              ? '승인됨'
                              : rec.status === 'rejected'
                              ? '거부됨'
                              : '대기중'}
                          </Badge>
                          <Badge variant="primary" size="sm">
                            점수 {(rec.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-caption text-(--foreground-muted) ml-2">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(rec.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-(--foreground-muted)">
                추천 기록이 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
