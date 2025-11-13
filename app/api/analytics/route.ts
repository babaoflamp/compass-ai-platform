import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // 1. UsageStats 데이터 가져오기 (최근 30일)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const usageStats = await prisma.usageStats.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // 2. 전체 통계 집계
    const totalStats = await prisma.usageStats.aggregate({
      _sum: {
        apiCalls: true,
        tokensUsed: true,
        chatCount: true,
        recommendCount: true,
      },
    })

    // 3. 학생별 활동 통계
    const studentActivity = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        name: true,
        _count: {
          select: {
            chatLogs: true,
            recommendations: true,
          },
        },
      },
      orderBy: {
        chatLogs: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // 4. 과목별 활동 통계 (교안이 있는 과목)
    const courseActivity = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        _count: {
          select: {
            materials: true,
            recommendations: true,
          },
        },
      },
      where: {
        materials: {
          some: {},
        },
      },
      orderBy: {
        recommendations: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // 5. 최근 채팅 활동
    const recentChats = await prisma.chatLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        question: true,
        confidence: true,
        createdAt: true,
        student: {
          select: {
            studentId: true,
            name: true,
          },
        },
      },
    })

    // 6. 최근 추천 활동
    const recentRecommendations = await prisma.recommendation.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        score: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            studentId: true,
            name: true,
          },
        },
        course: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      usageStats: usageStats.map((stat) => ({
        date: stat.date.toISOString().split('T')[0],
        apiCalls: stat.apiCalls,
        tokensUsed: stat.tokensUsed,
        chatCount: stat.chatCount,
        recommendCount: stat.recommendCount,
        estimatedCost: stat.estimatedCost,
      })),
      totalStats: {
        totalApiCalls: totalStats._sum.apiCalls || 0,
        totalTokens: totalStats._sum.tokensUsed || 0,
        totalChats: totalStats._sum.chatCount || 0,
        totalRecommendations: totalStats._sum.recommendCount || 0,
      },
      studentActivity: studentActivity.map((student) => ({
        studentId: student.studentId,
        name: student.name,
        chatCount: student._count.chatLogs,
        recommendationCount: student._count.recommendations,
      })),
      courseActivity: courseActivity.map((course) => ({
        code: course.code,
        name: course.name,
        materialCount: course._count.materials,
        recommendationCount: course._count.recommendations,
      })),
      recentChats: recentChats.map((chat) => ({
        id: chat.id,
        question: chat.question.substring(0, 100) + (chat.question.length > 100 ? '...' : ''),
        confidence: chat.confidence,
        createdAt: chat.createdAt.toISOString(),
        student: chat.student,
      })),
      recentRecommendations: recentRecommendations.map((rec) => ({
        id: rec.id,
        score: rec.score,
        status: rec.status,
        createdAt: rec.createdAt.toISOString(),
        student: rec.student,
        course: rec.course,
      })),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
