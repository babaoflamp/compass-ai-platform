import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// CSV 데이터 검증 스키마
const StudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  grade: z.coerce.number().min(1).max(4).optional(),
  creativity: z.coerce.number().min(0).max(100),
  collaboration: z.coerce.number().min(0).max(100),
  problemSolving: z.coerce.number().min(0).max(100),
})

type StudentData = z.infer<typeof StudentSchema>

export async function POST(request: Request) {
  try {
    const { students } = await request.json()

    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format' },
        { status: 400 }
      )
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // 각 학생 데이터 처리
    for (let i = 0; i < students.length; i++) {
      try {
        // 데이터 검증
        const validatedData = StudentSchema.parse(students[i])

        // 역량 데이터 JSON 생성
        const competencies = {
          creativity: validatedData.creativity,
          collaboration: validatedData.collaboration,
          problemSolving: validatedData.problemSolving,
        }

        // DB에 저장 (upsert: 이미 있으면 업데이트, 없으면 생성)
        await prisma.student.upsert({
          where: { studentId: validatedData.studentId },
          update: {
            name: validatedData.name,
            email: validatedData.email || null,
            department: validatedData.department || null,
            grade: validatedData.grade || null,
            competencies: JSON.stringify(competencies),
          },
          create: {
            studentId: validatedData.studentId,
            name: validatedData.name,
            email: validatedData.email || null,
            department: validatedData.department || null,
            grade: validatedData.grade || null,
            competencies: JSON.stringify(competencies),
          },
        })

        successCount++
      } catch (error) {
        failedCount++
        if (error instanceof z.ZodError) {
          errors.push(
            `Row ${i + 1}: ${error.errors.map((e) => e.message).join(', ')}`
          )
        } else {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    // 결과 반환
    const isSuccess = successCount > 0
    const message = isSuccess
      ? `${successCount}명의 학생 데이터가 성공적으로 업로드되었습니다.${
          failedCount > 0 ? ` (${failedCount}건 실패)` : ''
        }`
      : '업로드에 실패했습니다.'

    return NextResponse.json({
      success: isSuccess,
      message,
      stats: {
        total: students.length,
        success: successCount,
        failed: failedCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
