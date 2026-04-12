import nodemailer from 'nodemailer'

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '')

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendVerificationCodeEmail({ to, name, code }) {
  const transporter = createTransporter()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[email verification] Code for ${to}: ${code}`)
      return
    }

    throw new Error('Email service is not configured')
  }

  await transporter.sendMail({
    from,
    to,
    subject: 'Verify your email address',
    text: `Hi ${name || 'there'}, your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Verify your email address</h2>
        <p style="margin: 0 0 12px;">Hi ${name || 'there'},</p>
        <p style="margin: 0 0 12px;">Use this one-time code to verify your account:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${code}</div>
        <p style="margin: 0;">This code expires in 10 minutes.</p>
      </div>
    `,
  })
}
