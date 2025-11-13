import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        competencyWeights: true,
      },
      orderBy: {
        code: 'asc',
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('과목 목록 조회 실패:', error)
    return NextResponse.json(
      { error: '과목 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
