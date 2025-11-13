import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/materials - 교안 업로드 (PDF 파일 또는 텍스트)
export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const file = formData.get('file') as File | null
    const textContent = formData.get('content') as string | null

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'Course ID and title are required' },
        { status: 400 }
      )
    }

    if (!file && !textContent) {
      return NextResponse.json(
        { error: 'Either file or content is required' },
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

    let content = ''
    let filename = `${title}.txt`

    // TXT 파일 업로드된 경우
    if (file) {
      // TXT 파일인지 확인
      if (!file.type.includes('text/') && !file.name.endsWith('.txt')) {
        return NextResponse.json(
          { error: 'Only text files (.txt) are supported' },
          { status: 400 }
        )
      }

      try {
        // 텍스트 파일 읽기
        content = await file.text()

        if (!content || content.trim().length === 0) {
          return NextResponse.json(
            { error: 'Text file is empty' },
            { status: 400 }
          )
        }

        filename = file.name
      } catch (fileError) {
        console.error('File reading error:', fileError)
        return NextResponse.json(
          {
            error: 'Failed to read text file',
            details: fileError instanceof Error ? fileError.message : 'Unknown error'
          },
          { status: 400 }
        )
      }
    } else {
      // 텍스트 직접 입력된 경우
      content = textContent!
    }

    // DB에 교안 저장 (임베딩 생성 제거, MVP에서는 키워드 검색만 사용)
    const material = await prisma.courseMaterial.create({
      data: {
        courseId: parseInt(courseId),
        filename,
        title,
        content,
        embeddingId: null, // MVP에서는 벡터 임베딩 미사용
      },
    })

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        title: material.title,
        filename: material.filename,
        courseId: material.courseId,
        contentLength: content.length,
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
