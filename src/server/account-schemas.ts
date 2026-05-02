import { z } from 'zod';

export const accountProfileSchema = z.object({
  firstName: z.string().trim().min(2, 'Enter a first name.'),
  lastName: z.string().trim().min(2, 'Enter a last name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phoneNumber: z
    .string()
    .trim()
    .max(30, 'Phone number is too long.')
    .optional()
    .transform((value) => value ?? '')
    .refine((value) => value === '' || /^[0-9+\s()\-]{7,30}$/.test(value), 'Enter a valid phone number.'),
});

export const accountAddressSchema = z.object({
  label: z.string().trim().min(2, 'Enter an address label.'),
  fullName: z.string().trim().min(2, 'Enter the recipient name.'),
  phoneNumber: z
    .string()
    .trim()
    .max(30, 'Phone number is too long.')
    .optional()
    .transform((value) => value ?? '')
    .refine((value) => value === '' || /^[0-9+\s()\-]{7,30}$/.test(value), 'Enter a valid phone number.'),
  line1: z.string().trim().min(4, 'Enter the first address line.'),
  line2: z.string().trim().optional().transform((value) => value ?? ''),
  city: z.string().trim().min(2, 'Enter a city or town.'),
  state: z.string().trim().optional().transform((value) => value ?? ''),
  postcode: z.string().trim().min(3, 'Enter a postcode or ZIP code.'),
  country: z.string().trim().min(2, 'Enter a country.'),
  isDefault: z.boolean().default(false),
});

export function formatAccountValidationErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const key = issue.path.join('.');

    if (key && !errors[key]) {
      errors[key] = issue.message;
    }

    return errors;
  }, {});
}
