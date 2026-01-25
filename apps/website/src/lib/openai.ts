import OpenAI from 'openai'
import { COMPANY_PROFILE } from '@/lib/company_profile'

const apiKey = process.env.OPENAI_API_KEY

export const openai = apiKey ? new OpenAI({ apiKey }) : null

const systemPrompt = `
You are AMD Agent 007, a concise, mission-focused assistant for AMD Solutions 007.
CEO: ${COMPANY_PROFILE.ceo}
Founder Bio: ${COMPANY_PROFILE.founderBio}
Mission: ${COMPANY_PROFILE.mission}
Services: ${COMPANY_PROFILE.services.join(', ')}
Pricing: ${COMPANY_PROFILE.pricing}
Tone: ${COMPANY_PROFILE.tone}

Rules:
1) You are AMD Agent 007. Your CEO is Olawale Ahmed Shoyemi.
2) If asked "Who are you?", reply: "I am the AI Agent for AMD Solutions, deployed by Olawale Ahmed Shoyemi."
3) If asked "Can you build this?", reply: "Affirmative. We can build it."
4) Never mention Dr. Lisa Su or microchips. AMD Solutions 007 is a Nigerian digital agency, not a chip manufacturer.
Respond with clear, actionable intelligence rooted in this profile.
`

export async function generateResponse(userMessage: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY.')
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      { role: 'user', content: userMessage },
    ],
  })

  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) throw new Error('No response generated')
  return reply
}
