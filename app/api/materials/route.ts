import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/openai'

// POST /api/materials - 교안 업로드 및 임베딩 생성
export async function POST(request: Request) {
  try {
    const { courseId, title, content } = await request.json()

    if (!courseId || !title || !content) {
      return NextResponse.json(
        { error: 'Course ID, title, and content are required' },
        { status: 400 }
      )
    }

    // 과목 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // OpenAI embeddings 생성 (옵션)
    let embeddingId = null
    if (process.env.OPENAI_API_KEY) {
      try {
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: content.substring(0, 8000), // 토큰 제한
        })
        // 임베딩 ID는 단순히 생성된 타임스탬프로 사용
        embeddingId = `emb_${Date.now()}`
      } catch (e) {
        console.error('Embedding creation failed:', e)
        // 임베딩 실패해도 계속 진행
      }
    }

    // DB에 교안 저장
    const material = await prisma.courseMaterial.create({
      data: {
        courseId: parseInt(courseId),
        filename: `${title}.txt`,
        title,
        content,
        embeddingId,
      },
    })

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        title: material.title,
        courseId: material.courseId,
      },
    })
  } catch (error) {
    console.error('Material upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload material' },
      { status: 500 }
    )
  }
}

// GET /api/materials?courseId=123 - 특정 과목의 교안 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const materials = await prisma.courseMaterial.findMany({
      where: {
        courseId: parseInt(courseId),
      },
      select: {
        id: true,
        title: true,
        filename: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('Materials fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}
