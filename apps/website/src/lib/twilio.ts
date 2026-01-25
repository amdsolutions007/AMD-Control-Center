import twilio from 'twilio'

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env

export const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null

export async function sendSMS(to: string, body: string) {
  if (!twilioClient) {
    throw new Error('Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.')
  }

  if (!TWILIO_PHONE) {
    throw new Error('Twilio sender number is missing. Set TWILIO_PHONE.')
  }

  const message = await twilioClient.messages.create({
    to,
    from: TWILIO_PHONE,
    body,
  })

  return message.sid
}
