import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chatCompletion, checkOllamaHealth, trackTokenUsage } from '@/lib/ollama'

// 간단한 텍스트 유사도 검색 (키워드 기반)
function simpleSearch(query: string, materials: any[]): any[] {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)

  const scoredMaterials = materials.map((material) => {
    const contentLower = material.content.toLowerCase()
    let score = 0

    // 키워드 매칭 점수 계산
    queryWords.forEach((word) => {
      const count = (contentLower.match(new RegExp(word, 'g')) || []).length
      score += count
    })

    return { ...material, score }
  })

  // 점수 기준 정렬
  return scoredMaterials.filter((m) => m.score > 0).sort((a, b) => b.score - a.score)
}

export async function POST(request: Request) {
  try {
    const { studentId, courseId, question } = await request.json()

    if (!studentId || !question) {
      return NextResponse.json(
        { error: 'Student ID and question are required' },
        { status: 400 }
      )
    }

    // Ollama 서버 연결 확인
    const isOllamaHealthy = await checkOllamaHealth()
    if (!isOllamaHealthy) {
      return NextResponse.json(
        {
          error: 'Ollama server is not available',
          answer: 'Ollama 서버에 연결할 수 없습니다. 관리자에게 문의하세요.',
        },
        { status: 503 }
      )
    }

    // 학생 확인
    const student = await prisma.student.findUnique({
      where: { studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // 과목의 교안 조회
    let materials: any[] = []
    if (courseId) {
      materials = await prisma.courseMaterial.findMany({
        where: { courseId: parseInt(courseId) },
      })
    } else {
      // 과목 지정 안 된 경우 모든 교안 검색
      materials = await prisma.courseMaterial.findMany({
        take: 50, // 최대 50개
      })
    }

    if (materials.length === 0) {
      return NextResponse.json({
        answer: '등록된 교안이 없습니다. 관리자에게 교안 업로드를 요청하세요.',
        sources: [],
        confidence: 0,
      })
    }

    // 관련 교안 검색 (간단한 키워드 기반)
    const relevantMaterials = simpleSearch(question, materials).slice(0, 3)

    if (relevantMaterials.length === 0) {
      return NextResponse.json({
        answer:
          '질문과 관련된 교안을 찾을 수 없습니다. 다른 방식으로 질문해 주세요.',
        sources: [],
        confidence: 0,
      })
    }

    // RAG: 관련 교안을 컨텍스트로 사용하여 답변 생성
    const context = relevantMaterials
      .map(
        (m, i) =>
          `[출처 ${i + 1}: ${m.title}]\n${m.content.substring(0, 1500)}`
      )
      .join('\n\n---\n\n')

    const completion = await chatCompletion([
      {
        role: 'system',
        content: `당신은 대학교 AI 튜터입니다. 제공된 교안 자료만을 사용하여 학생의 질문에 답변하세요.
규칙:
1. 교안에 없는 내용은 답변하지 마세요
2. 답변 시 출처를 명시하세요 (예: "[출처 1 참조]")
3. 간결하고 명확하게 설명하세요
4. 교안에 정보가 부족하면 "교안에 해당 내용이 없습니다"라고 답변하세요`,
      },
      {
        role: 'user',
        content: `다음은 관련 교안 내용입니다:\n\n${context}\n\n질문: ${question}`,
      },
    ], {
      temperature: 0.3,
      maxTokens: 800,
    })

    // 토큰 사용량 추적
    await trackTokenUsage(
      completion.usage.promptTokens,
      completion.usage.completionTokens,
      'chat',
      completion.model
    )

    const answer = completion.content || '답변을 생성할 수 없습니다.'

    // 신뢰도 계산 (간단한 버전: 관련 교안 개수 기반)
    const confidence = Math.min(relevantMaterials.length / 3, 1) * 100

    // 채팅 로그 저장
    await prisma.chatLog.create({
      data: {
        studentId: student.id,
        courseId: courseId ? parseInt(courseId) : null,
        question,
        answer,
        sources: JSON.stringify(
          relevantMaterials.map((m) => ({
            title: m.title,
            score: m.score,
          }))
        ),
        confidence,
      },
    })

    return NextResponse.json({
      answer,
      sources: relevantMaterials.map((m) => ({
        title: m.title,
        excerpt: m.content.substring(0, 200) + '...',
      })),
      confidence: Math.round(confidence),
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process question',
        answer: '질문을 처리하는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
