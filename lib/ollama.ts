// Ollama API 클라이언트
// exaone3.5:7.8b 모델 사용 (로컬 LLM)

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'exaone3.5:7.8b'

if (!process.env.OLLAMA_URL) {
  console.warn('Warning: OLLAMA_URL not set, using default: http://localhost:11434')
}

interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

/**
 * Ollama Chat API 호출 (OpenAI chat.completions.create와 유사한 인터페이스)
 */
export async function chatCompletion(messages: OllamaChatMessage[], options?: {
  temperature?: number
  maxTokens?: number
}) {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 800,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data: OllamaChatResponse = await response.json()

    return {
      content: data.message.content,
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    }
  } catch (error) {
    console.error('Ollama chat completion error:', error)
    throw new Error('Failed to connect to Ollama server. Is it running?')
  }
}

/**
 * Ollama Generate API 호출 (단순 프롬프트 완성용)
 */
export async function generateCompletion(prompt: string, systemPrompt?: string) {
  try {
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 800,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data: OllamaGenerateResponse = await response.json()

    return {
      content: data.response,
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    }
  } catch (error) {
    console.error('Ollama generate completion error:', error)
    throw new Error('Failed to connect to Ollama server. Is it running?')
  }
}

/**
 * 토큰 사용량 추적 유틸리티
 */
export async function trackTokenUsage(
  promptTokens: number,
  completionTokens: number,
  featureType: 'chat' | 'recommend',
  model: string = OLLAMA_MODEL
) {
  const totalTokens = promptTokens + completionTokens

  // Ollama는 로컬이므로 비용이 들지 않지만, 사용량은 추적
  console.log(`[Token Usage] Model: ${model}, Prompt: ${promptTokens}, Completion: ${completionTokens}, Total: ${totalTokens}`)

  try {
    // 동적 import로 Prisma Client 가져오기 (서버 컴포넌트에서만 사용)
    const { prisma } = await import('./db')

    // 오늘 날짜 (시간 제외)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // UsageStats 업데이트 (없으면 생성)
    await prisma.usageStats.upsert({
      where: { date: today },
      update: {
        apiCalls: { increment: 1 },
        tokensUsed: { increment: totalTokens },
        chatCount: featureType === 'chat' ? { increment: 1 } : undefined,
        recommendCount: featureType === 'recommend' ? { increment: 1 } : undefined,
        // Ollama는 로컬이므로 비용 0
        estimatedCost: 0.0,
      },
      create: {
        date: today,
        apiCalls: 1,
        tokensUsed: totalTokens,
        chatCount: featureType === 'chat' ? 1 : 0,
        recommendCount: featureType === 'recommend' ? 1 : 0,
        estimatedCost: 0.0,
      },
    })

    console.log(`[UsageStats] Saved to database for ${today.toISOString().split('T')[0]}`)
  } catch (error) {
    console.error('Failed to save usage stats:', error)
  }

  return totalTokens
}

/**
 * Ollama 서버 상태 확인
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`)
    return response.ok
  } catch (error) {
    console.error('Ollama health check failed:', error)
    return false
  }
}
