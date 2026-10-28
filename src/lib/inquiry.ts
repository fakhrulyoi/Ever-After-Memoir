import { z } from 'zod'

import { todayISO } from './dates'

const today = () => todayISO()

/**
 * Shared by the contact form (browser) and the API route (server).
 * Error messages are keys from lib/i18n so the form can show them in either language.
 */
export const inquirySchema = z.object({
  fullName: z.string().trim().min(1, 'err.name').max(120, 'err.nameLong'),
  partnerName: z.string().trim().max(120, 'err.long').default(''),
  email: z.string().trim().max(254).email('err.email'),
  whatsapp: z
    .string()
    .trim()
    .max(30)
    .regex(/^(\+?[\d\s-]{7,20})?$/, 'err.whatsapp')
    .default(''),
  weddingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'err.date')
    .refine((d) => d >= today(), 'err.dateFuture'),
  location: z.string().trim().min(1, 'err.location').max(200),
  celebrationType: z.string().trim().min(1, 'err.type').max(80),
  serviceInterest: z.string().trim().min(1, 'err.service').max(120),
  budget: z.string().trim().max(80).default(''),
  notes: z.string().trim().max(4000, 'err.notes').default(''),
  consent: z.literal(true, { message: 'err.consent' }),
  // Spam protection
  website: z.string().max(500).default(''),
  startedAt: z.number().int().positive(),
  lang: z.enum(['en', 'ms']).default('en'),
})

export type InquiryInput = z.input<typeof inquirySchema>
export type InquiryFieldErrors = Partial<Record<keyof InquiryInput, string>>

export function fieldErrors(error: z.ZodError): InquiryFieldErrors {
  const out: InquiryFieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof InquiryInput
    if (key && !out[key]) out[key] = issue.message
  }
  return out
}
