import { z } from 'zod'

export const PromptValidationSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10000 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  
  promptText: z.string()
    .min(1, 'Prompt text is required')
    .max(5000, 'Prompt text must be less than 5000 characters'),
  
  visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
  
  tags: z.array(z.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  isDraft: z.boolean().default(true)
})

export type PromptValidationInput = z.infer<typeof PromptValidationSchema>

export class PromptValidator {
  static validate(input: unknown): { isValid: boolean; errors?: string[]; data?: PromptValidationInput } {
    const result = PromptValidationSchema.safeParse(input)
    
    if (!result.success) {
      const errors = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
      return { isValid: false, errors }
    }
    
    return { isValid: true, data: result.data }
  }
  
  static validateTitle(title: string): boolean {
    return title.length >= 3 && title.length <= 100
  }
  
  static validateTags(tags: string[]): boolean {
    return tags.length <= 10 && tags.every(tag => tag.length <= 30 && /^[a-zA-Z0-9\-\_\u4e00-\u9fff]+$/.test(tag))
  }
}