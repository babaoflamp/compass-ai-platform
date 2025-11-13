import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chatCompletion, checkOllamaHealth, trackTokenUsage } from '@/lib/ollama'

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // 1. 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // 2. 모든 과목 조회
    const courses = await prisma.course.findMany()

    if (courses.length === 0) {
      return NextResponse.json(
        { error: 'No courses available' },
        { status: 404 }
      )
    }

    // 3. 학생 역량 데이터 파싱
    const competencies = JSON.parse(student.competencies)

    // 4. 과목별 역량 가중치 파싱 및 점수 계산
    const coursesWithScores = courses.map((course) => {
      const weights = JSON.parse(course.competencyWeights)

      // 가중 평균 계산: 학생 역량과 과목 요구 역량의 매칭 점수
      const matchScore =
        competencies.creativity * weights.creativity +
        competencies.collaboration * weights.collaboration +
        competencies.problemSolving * weights.problemSolving

      return {
        code: course.code,
        name: course.name,
        description: course.description,
        credits: course.credits,
        department: course.department,
        matchScore: Math.round(matchScore * 100) / 100,
        weights,
      }
    })

    // 5. 매칭 점수 기준 정렬 (높은 순)
    coursesWithScores.sort((a, b) => b.matchScore - a.matchScore)

    // 6. 상위 5개 과목 선택
    const topCourses = coursesWithScores.slice(0, 5)

    // 7. Ollama 서버 연결 확인
    const isOllamaHealthy = await checkOllamaHealth()
    if (!isOllamaHealthy) {
      // Ollama 서버가 없으면 기본 추천만 반환
      const recommendations = topCourses.map((course, index) => ({
        rank: index + 1,
        course: {
          code: course.code,
          name: course.name,
          description: course.description,
          credits: course.credits,
          department: course.department,
        },
        matchScore: course.matchScore,
        reason: `이 과목은 당신의 역량과 ${course.matchScore.toFixed(1)}% 매칭됩니다.`,
      }))

      return NextResponse.json({
        student: {
          name: student.name,
          studentId: student.studentId,
          competencies,
        },
        recommendations,
        note: 'Ollama 서버에 연결할 수 없어 기본 추천을 제공합니다.',
      })
    }

    // 8. Ollama로 추천 사유 생성
    const prompt = `당신은 대학교 학습 어드바이저입니다. 다음 학생 정보를 보고 추천된 과목에 대한 간단한 추천 사유를 생성하세요.

학생 정보:
- 이름: ${student.name}
- 역량:
  * 창의성: ${competencies.creativity}점
  * 협업능력: ${competencies.collaboration}점
  * 문제해결: ${competencies.problemSolving}점

추천 과목 목록:
${topCourses.map((c, i) => `${i + 1}. ${c.name} (${c.code}) - 매칭 점수: ${c.matchScore}`).join('\n')}

각 과목에 대해 1-2문장으로 추천 사유를 작성하세요. JSON 형식으로 응답하세요:
{
  "recommendations": [
    {
      "courseCode": "CS101",
      "reason": "추천 사유..."
    }
  ]
}`

    const completion = await chatCompletion([
      {
        role: 'system',
        content: '당신은 학생의 역량에 맞는 과목을 추천하는 전문 어드바이저입니다. 간결하고 명확하게 추천 사유를 설명하세요.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.7,
      maxTokens: 800,
    })

    // 토큰 사용량 추적
    await trackTokenUsage(
      completion.usage.promptTokens,
      completion.usage.completionTokens,
      'recommend',
      completion.model
    )

    const aiResponse = completion.content || '{}'

    // JSON 파싱 시도 (마크다운 코드 블록 제거)
    let aiRecommendations: any = { recommendations: [] }
    try {
      // 마크다운 코드 블록 제거 (```json ... ``` 또는 ``` ... ```)
      let cleanedResponse = aiResponse.trim()
      if (cleanedResponse.startsWith('```')) {
        // ```json 또는 ```로 시작하면 제거
        cleanedResponse = cleanedResponse
          .replace(/^```(?:json)?\n?/i, '')  // 시작 코드 블록 제거
          .replace(/\n?```$/, '')  // 끝 코드 블록 제거
          .trim()
      }
      aiRecommendations = JSON.parse(cleanedResponse)
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      console.error('Raw AI response:', aiResponse)
    }

    // 8. 최종 추천 결과 생성
    const recommendations = topCourses.map((course, index) => {
      const aiRec = aiRecommendations.recommendations?.find(
        (r: any) => r.courseCode === course.code
      )

      return {
        rank: index + 1,
        course: {
          code: course.code,
          name: course.name,
          description: course.description,
          credits: course.credits,
          department: course.department,
        },
        matchScore: course.matchScore,
        reason: aiRec?.reason || `이 과목은 당신의 역량과 ${course.matchScore.toFixed(1)}% 매칭됩니다.`,
      }
    })

    // 9. 추천 기록 저장
    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          studentId: student.id,
          courseId: courses.find((c) => c.code === rec.course.code)!.id,
          reason: rec.reason,
          score: rec.matchScore / 100,
          status: 'pending',
        },
      })
    }

    return NextResponse.json({
      student: {
        name: student.name,
        studentId: student.studentId,
        competencies,
      },
      recommendations,
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
