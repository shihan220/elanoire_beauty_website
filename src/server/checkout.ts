import { z } from 'zod';

const requiredText = (message: string) => z.string().trim().min(1, message);

export const billingInfoSchema = z.object({
  fullName: requiredText('Full name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().min(7, 'Enter a valid phone number.'),
  country: requiredText('Country is required.'),
  line1: requiredText('Address line 1 is required.'),
  line2: z.string().trim().optional().transform((value) => value || undefined),
  city: requiredText('City is required.'),
  region: requiredText('County or state is required.'),
  postcode: requiredText('Postcode or ZIP is required.'),
});

export const checkoutRequestSchema = z.object({
  billing: billingInfoSchema,
  paymentMethod: z.literal('card', {
    error: 'Select card payment to continue.',
  }),
  saveBillingInfo: z.boolean().optional().default(false),
});

export type BillingInfo = z.infer<typeof billingInfoSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export function formatCheckoutValidationErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((errors, issue) => {
    const key = issue.path.join('.');

    if (key && !errors[key]) {
      errors[key] = issue.message;
    }

    return errors;
  }, {});
}
