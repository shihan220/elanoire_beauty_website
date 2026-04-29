import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.'),
  category: z.enum(['SKINCARE', 'MAKEUP', 'FRAGRANCE']),
  pricePence: z.number().int().min(100, 'Price must be at least £1.00.'),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative.').max(9999, 'Stock is too high.'),
  image: z.string().trim().url('Enter a valid image URL.'),
  description: z.string().trim().min(12, 'Description is required.'),
});

export const partialAdminProductSchema = adminProductSchema.partial();

export function formatAdminValidationErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const key = issue.path.join('.');
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
    return errors;
  }, {});
}
