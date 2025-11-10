import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 샘플 과목 데이터
  const courses = [
    {
      code: 'CS101',
      name: '프로그래밍 기초',
      description: 'Python을 활용한 프로그래밍 입문',
      credits: 3,
      department: '컴퓨터공학과',
      competencyWeights: JSON.stringify({
        creativity: 0.6,
        collaboration: 0.3,
        problemSolving: 0.9,
      }),
    },
    {
      code: 'CS201',
      name: '자료구조',
      description: '배열, 리스트, 트리, 그래프 등 핵심 자료구조',
      credits: 3,
      department: '컴퓨터공학과',
      competencyWeights: JSON.stringify({
        creativity: 0.5,
        collaboration: 0.2,
        problemSolving: 0.95,
      }),
    },
    {
      code: 'CS301',
      name: '데이터베이스 시스템',
      description: 'SQL, NoSQL 데이터베이스 설계 및 관리',
      credits: 3,
      department: '컴퓨터공학과',
      competencyWeights: JSON.stringify({
        creativity: 0.4,
        collaboration: 0.5,
        problemSolving: 0.8,
      }),
    },
    {
      code: 'DES101',
      name: '창의적 사고와 디자인',
      description: '디자인 씽킹과 창의적 문제 해결',
      credits: 3,
      department: '디자인학과',
      competencyWeights: JSON.stringify({
        creativity: 0.95,
        collaboration: 0.8,
        problemSolving: 0.7,
      }),
    },
    {
      code: 'DES202',
      name: 'UI/UX 디자인',
      description: '사용자 경험 중심의 인터페이스 디자인',
      credits: 3,
      department: '디자인학과',
      competencyWeights: JSON.stringify({
        creativity: 0.9,
        collaboration: 0.7,
        problemSolving: 0.6,
      }),
    },
    {
      code: 'BUS101',
      name: '경영학 원론',
      description: '경영의 기본 개념과 원리',
      credits: 3,
      department: '경영학과',
      competencyWeights: JSON.stringify({
        creativity: 0.5,
        collaboration: 0.8,
        problemSolving: 0.6,
      }),
    },
    {
      code: 'BUS202',
      name: '프로젝트 관리',
      description: '팀 프로젝트 기획 및 실행',
      credits: 3,
      department: '경영학과',
      competencyWeights: JSON.stringify({
        creativity: 0.6,
        collaboration: 0.95,
        problemSolving: 0.8,
      }),
    },
    {
      code: 'ENG101',
      name: '공학설계 입문',
      description: '기계 및 전기 공학 기초',
      credits: 3,
      department: '기계공학과',
      competencyWeights: JSON.stringify({
        creativity: 0.7,
        collaboration: 0.6,
        problemSolving: 0.9,
      }),
    },
    {
      code: 'AI301',
      name: '인공지능 개론',
      description: '머신러닝과 딥러닝 기초',
      credits: 3,
      department: '컴퓨터공학과',
      competencyWeights: JSON.stringify({
        creativity: 0.8,
        collaboration: 0.5,
        problemSolving: 0.9,
      }),
    },
    {
      code: 'TEAM101',
      name: '팀워크와 리더십',
      description: '효과적인 협업과 리더십 개발',
      credits: 2,
      department: '교양',
      competencyWeights: JSON.stringify({
        creativity: 0.5,
        collaboration: 0.95,
        problemSolving: 0.6,
      }),
    },
  ]

  // 과목 생성
  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: course,
      create: course,
    })
    console.log(`✓ Created/Updated course: ${course.code} - ${course.name}`)
  }

  console.log('✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
