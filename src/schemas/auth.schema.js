
import { z } from 'zod'

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters'),

    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters'),

    email: z
      .string()
      .trim()
      .email('Please enter a valid email address'),

    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required'),

    gender: z.enum(['male', 'female']),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    rePassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine(
    (data) => data.password === data.rePassword,
    {
      message: 'Passwords do not match',
      path: ['rePassword'],
    },
  )
