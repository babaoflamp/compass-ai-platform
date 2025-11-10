'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface CompetencyData {
  creativity: number
  collaboration: number
  problemSolving: number
}

interface CompetencyChartProps {
  data: CompetencyData
}

const COMPETENCY_LABELS: Record<keyof CompetencyData, string> = {
  creativity: '창의성',
  collaboration: '협업능력',
  problemSolving: '문제해결',
}

export default function CompetencyChart({ data }: CompetencyChartProps) {
  // Recharts 데이터 형식으로 변환
  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: COMPETENCY_LABELS[key as keyof CompetencyData],
    score: value,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
        <Radar
          name="역량 점수"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value}점`, '점수']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
