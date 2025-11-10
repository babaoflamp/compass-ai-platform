'use client'

interface CompetencyScoreCardProps {
  label: string
  score: number
  icon?: string
}

export default function CompetencyScoreCard({
  label,
  score,
  icon = '📊',
}: CompetencyScoreCardProps) {
  // 점수에 따른 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '우수'
    if (score >= 60) return '양호'
    if (score >= 40) return '보통'
    return '노력 필요'
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${getScoreColor(score)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-sm">{label}</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-white">
          {getScoreLabel(score)}
        </span>
      </div>
      <div className="text-3xl font-bold">{score}점</div>
      <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${score}%`,
            backgroundColor: 'currentColor',
          }}
        />
      </div>
    </div>
  )
}
