import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// 토큰 사용량 추적을 위한 유틸리티
export async function trackTokenUsage(
  prompt: string,
  response: string,
  model: string = 'gpt-4o-mini'
) {
  // 간단한 토큰 추정 (정확하지 않음, 실제로는 OpenAI response에서 가져와야 함)
  const estimatedTokens = Math.ceil((prompt.length + response.length) / 4);

  // TODO: UsageStats 테이블에 저장
  console.log(`[Token Usage] Model: ${model}, Estimated tokens: ${estimatedTokens}`);

  return estimatedTokens;
}
