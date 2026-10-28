import { z } from 'zod'

import { todayISO } from './dates'

const today = () => todayISO()

/** Shared by the contact form (browser) and the API route (server). */
export const inquirySchema = z.object({
  fullName: z.string().trim().min(1, 'Please tell us your name').max(120, 'Keep your name under 120 characters'),
  partnerName: z.string().trim().max(120, 'Keep this under 120 characters').default(''),
  email: z.string().trim().max(254).email('Please enter a valid email address'),
  whatsapp: z
    .string()
    .trim()
    .max(30)
    .regex(/^(\+?[\d\s-]{7,20})?$/, 'Use digits only, including the country code — e.g. +60 12 345 6789')
    .default(''),
  weddingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose your wedding date')
    .refine((d) => d >= today(), 'The date should be today or later'),
  location: z.string().trim().min(1, 'Where is the wedding? A city or venue is fine').max(200),
  celebrationType: z.string().trim().min(1, 'Please choose the type of celebration').max(80),
  serviceInterest: z.string().trim().min(1, 'Please choose a service — “Not sure yet” is fine').max(120),
  budget: z.string().trim().max(80).default(''),
  notes: z.string().trim().max(4000, 'Please keep your notes under 4,000 characters').default(''),
  consent: z.literal(true, { message: 'Please agree so we can keep your details to reply' }),
  // Spam protection
  website: z.string().max(500).default(''),
  startedAt: z.number().int().positive(),
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
