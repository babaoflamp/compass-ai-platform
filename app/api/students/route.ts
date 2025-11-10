import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/students - 전체 학생 목록 조회
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        name: true,
        department: true,
        grade: true,
      },
      orderBy: {
        studentId: 'asc',
      },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Students fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
