'use client';

import { ArrowRight, Check, CreditCard, LockKeyhole } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

type CheckoutLineItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  pricePence: number;
  lineTotalPence: number;
};

type BillingFormState = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postcode: string;
};

type CheckoutFormProps = {
  items: CheckoutLineItem[];
  subtotalPence: number;
  initialBilling: BillingFormState;
  hasSavedBilling: boolean;
};

type CheckoutResponse = {
  message?: string;
  url?: string;
  errors?: Record<string, string>;
};

const emptyBilling: BillingFormState = {
  fullName: '',
  email: '',
  phone: '',
  country: 'United Kingdom',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postcode: '',
};

function formatCurrency(valuePence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(valuePence / 100);
}

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function TextField({
  id,
  label,
  value,
  error,
  autoComplete,
  inputMode,
  optional = false,
  onChange,
}: {
  id: keyof BillingFormState;
  label: string;
  value: string;
  error?: string;
  autoComplete?: string;
  inputMode?: 'email' | 'tel' | 'text';
  optional?: boolean;
  onChange: (field: keyof BillingFormState, value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 block">
        {label}
        {optional ? <span className="normal-case tracking-normal text-stone-400"> optional</span> : null}
      </label>
      <input
        id={id}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(id, event.target.value)}
        className="w-full bg-transparent border-0 border-b border-stone-300 px-0 py-4 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 transition-colors"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validateBilling(billing: BillingFormState) {
  const errors: Record<string, string> = {};

  if (!billing.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!isEmail(billing.email)) errors.email = 'Enter a valid email address.';
  if (billing.phone.trim().length < 7) errors.phone = 'Enter a valid phone number.';
  if (!billing.country.trim()) errors.country = 'Country is required.';
  if (!billing.line1.trim()) errors.line1 = 'Address line 1 is required.';
  if (!billing.city.trim()) errors.city = 'City is required.';
  if (!billing.region.trim()) errors.region = 'County or state is required.';
  if (!billing.postcode.trim()) errors.postcode = 'Postcode or ZIP is required.';

  return errors;
}

function mapServerErrors(errors?: Record<string, string>) {
  if (!errors) return {};

  return Object.entries(errors).reduce<Record<string, string>>((mappedErrors, [key, value]) => {
    mappedErrors[key.replace('billing.', '')] = value;
    return mappedErrors;
  }, {});
}

export function CheckoutForm({
  items,
  subtotalPence,
  initialBilling: initialBillingData,
  hasSavedBilling,
}: CheckoutFormProps) {
  const resolvedInitialBilling = useMemo(
    () => ({ ...emptyBilling, ...initialBillingData }),
    [initialBillingData],
  );
  const [billing, setBilling] = useState<BillingFormState>(resolvedInitialBilling);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saveBillingInfo, setSaveBillingInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateBilling(field: keyof BillingFormState, value: string) {
    setBilling((currentBilling) => ({ ...currentBilling, [field]: value }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function useSavedBilling() {
    if (!hasSavedBilling) return;

    setBilling(resolvedInitialBilling);
    setErrors({});
    setFormError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateBilling(billing);

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing,
          paymentMethod: 'card',
          saveBillingInfo,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok || !body.url) {
        setErrors(mapServerErrors(body.errors));
        setFormError(body.message ?? 'Checkout could not be started. Please try again.');
        return;
      }

      window.location.href = body.url;
    } catch {
      setFormError('Checkout could not be started. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-16 lg:gap-24 items-start" noValidate>
      <div className="space-y-16">
        <section className="border-t border-stone-300 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-stone-500 block mb-4">
                Billing
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900">
                Billing information
              </h2>
            </div>
            {hasSavedBilling ? (
              <button
                type="button"
                onClick={useSavedBilling}
                className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
              >
                <Check size={14} strokeWidth={1.5} />
                Use Saved Details
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <TextField id="fullName" label="Full name" autoComplete="name" value={billing.fullName} error={errors.fullName} onChange={updateBilling} />
            <TextField id="email" label="Email address" autoComplete="email" inputMode="email" value={billing.email} error={errors.email} onChange={updateBilling} />
            <TextField id="phone" label="Phone number" autoComplete="tel" inputMode="tel" value={billing.phone} error={errors.phone} onChange={updateBilling} />
            <TextField id="country" label="Country" autoComplete="country-name" value={billing.country} error={errors.country} onChange={updateBilling} />
            <div className="sm:col-span-2">
              <TextField id="line1" label="Address line 1" autoComplete="address-line1" value={billing.line1} error={errors.line1} onChange={updateBilling} />
            </div>
            <div className="sm:col-span-2">
              <TextField id="line2" label="Address line 2" autoComplete="address-line2" value={billing.line2} error={errors.line2} optional onChange={updateBilling} />
            </div>
            <TextField id="city" label="City" autoComplete="address-level2" value={billing.city} error={errors.city} onChange={updateBilling} />
            <TextField id="region" label="County / State" autoComplete="address-level1" value={billing.region} error={errors.region} onChange={updateBilling} />
            <TextField id="postcode" label="Postcode / ZIP" autoComplete="postal-code" value={billing.postcode} error={errors.postcode} onChange={updateBilling} />
          </div>

          <label className="mt-8 flex items-start gap-3 text-sm text-stone-600 leading-relaxed">
            <input
              type="checkbox"
              checked={saveBillingInfo}
              onChange={(event) => setSaveBillingInfo(event.target.checked)}
              className="mt-1 h-4 w-4 accent-stone-900"
            />
            Save billing information for future orders.
          </label>
        </section>

        <section className="border-t border-stone-300 pt-10">
          <span className="text-xs tracking-[0.3em] uppercase text-stone-500 block mb-4">
            Payment
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-8">
            Payment method
          </h2>
          <div className="border border-stone-300 p-6 md:p-8 flex gap-5 items-start bg-[#faf9f6]">
            <input
              type="radio"
              checked
              readOnly
              aria-label="Card payment selected"
              className="mt-1 h-4 w-4 accent-stone-900"
            />
            <CreditCard size={24} strokeWidth={1.4} className="text-stone-900 shrink-0" />
            <div>
              <h3 className="text-xl font-serif text-stone-900 mb-2">
                Card payment
              </h3>
              <p className="text-sm text-stone-600 font-light leading-relaxed">
                Pay securely with Visa, Mastercard, debit, or credit card through Stripe.
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="border-t border-stone-300 pt-8 lg:sticky lg:top-32">
        <span className="text-xs tracking-[0.3em] uppercase text-stone-500 block mb-4">
          Review
        </span>
        <h2 className="text-3xl font-serif text-stone-900 mb-8">
          Order summary
        </h2>

        <div className="divide-y divide-stone-200 border-y border-stone-200 mb-8">
          {items.map((item) => (
            <article key={item.id} className="py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-stone-500 block mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-serif text-stone-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-stone-600">
                    Quantity {item.quantity} · {formatCurrency(item.pricePence)} each
                  </p>
                </div>
                <p className="text-sm text-stone-900 font-medium text-right">
                  {formatCurrency(item.lineTotalPence)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-5 pb-8 border-b border-stone-200">
          <div className="flex items-center justify-between gap-8 text-stone-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalPence)}</span>
          </div>
          <div className="flex items-center justify-between gap-8 text-stone-600">
            <span>Delivery</span>
            <span>Calculated later</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-8 py-8">
          <span className="text-xs tracking-[0.2em] uppercase text-stone-500">Total</span>
          <span className="text-2xl font-serif text-stone-900">{formatCurrency(subtotalPence)}</span>
        </div>

        {formError ? (
          <p className="text-sm text-[var(--elanoire-color-destructive)] leading-relaxed mb-5" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-stone-900 text-[#faf9f6] py-4 px-8 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Opening Payment' : 'Continue To Payment'}
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>

        <p className="mt-8 flex items-start gap-3 text-sm text-stone-500 font-light leading-relaxed">
          <LockKeyhole size={17} strokeWidth={1.4} className="mt-0.5 shrink-0" />
          Payment details are entered on Stripe Checkout. Prices are confirmed from the database before payment begins.
        </p>
      </aside>
    </form>
  );
}
