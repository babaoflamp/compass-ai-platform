import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/students/[studentId] - 특정 학생의 상세 정보 조회
export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: {
        studentId: params.studentId,
      },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // competencies JSON 파싱
    const competencies = JSON.parse(student.competencies)

    // 응답 데이터 구성
    const response = {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department,
      grade: student.grade,
      competencies,
      enrollments: student.enrollments.map((enrollment) => ({
        semester: enrollment.semester,
        grade: enrollment.grade,
        course: {
          code: enrollment.course.code,
          name: enrollment.course.name,
          credits: enrollment.course.credits,
        },
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Student fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}
