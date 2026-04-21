'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type Errors = Record<string, string>;

type TextFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function TextField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  error,
  onChange,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
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

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full bg-stone-900 text-[#faf9f6] py-4 px-8 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors"
    >
      {children}
      <ArrowRight size={16} strokeWidth={1.5} />
    </button>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <div className="border border-stone-300 bg-[#faf9f6] p-6 flex gap-4 items-start">
      <span className="mt-0.5 flex h-6 w-6 items-center justify-center border border-stone-900 text-stone-900">
        <Check size={14} strokeWidth={1.5} />
      </span>
      <p className="text-sm leading-relaxed text-stone-600">{message}</p>
    </div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="border border-stone-300 bg-[#faf9f6] p-6">
      <p className="text-sm leading-relaxed text-[var(--elanoire-color-destructive)]">
        {message}
      </p>
    </div>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setFormError('We could not sign you in with those details.');
      return;
    }

    setSubmitted(true);
    router.push('/account');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {submitted ? (
        <SuccessState message="Signed in successfully. Redirecting to your account." />
      ) : null}
      <FormError message={formError} />
      <TextField
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={setEmail}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        error={errors.password}
        onChange={setPassword}
      />
      <div className="flex items-center justify-between gap-6">
        <label className="flex items-center gap-3 text-sm text-stone-600">
          <input type="checkbox" className="h-4 w-4 accent-stone-900" />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-sm text-stone-900 border-b border-stone-900 hover:text-stone-500 hover:border-stone-500 transition-colors">
          Forgot password
        </Link>
      </div>
      <SubmitButton>{isSubmitting ? 'Signing In' : 'Sign In'}</SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!lastName.trim()) nextErrors.lastName = 'Enter your last name.';
    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!acceptsTerms) nextErrors.terms = 'Confirm you accept the account terms.';

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string; errors?: Errors };
      setFormError(data.message ?? 'We could not create your account.');
      setErrors(data.errors ?? {});
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (signInResult?.error) {
      setFormError('Your account was created, but we could not start a session.');
      return;
    }

    setSubmitted(true);
    router.push('/account');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {submitted ? (
        <SuccessState message="Account created successfully. Redirecting to your account." />
      ) : null}
      <FormError message={formError} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <TextField id="firstName" label="First name" autoComplete="given-name" value={firstName} error={errors.firstName} onChange={setFirstName} />
        <TextField id="lastName" label="Last name" autoComplete="family-name" value={lastName} error={errors.lastName} onChange={setLastName} />
      </div>
      <TextField id="email" label="Email address" type="email" autoComplete="email" value={email} error={errors.email} onChange={setEmail} />
      <TextField id="password" label="Password" type="password" autoComplete="new-password" value={password} error={errors.password} onChange={setPassword} />
      <div>
        <label className="flex items-start gap-3 text-sm text-stone-600 leading-relaxed">
          <input
            type="checkbox"
            checked={acceptsTerms}
            onChange={(event) => setAcceptsTerms(event.target.checked)}
            className="mt-1 h-4 w-4 accent-stone-900"
          />
          I agree to receive account updates and accept the Élanoire Beauty UK customer terms.
        </label>
        {errors.terms ? (
          <p className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">{errors.terms}</p>
        ) : null}
      </div>
      <SubmitButton>{isSubmitting ? 'Creating Account' : 'Create Account'}</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';

    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {submitted ? (
        <SuccessState message="Password reset validation is ready. When email delivery is connected, this flow can send a secure reset link." />
      ) : null}
      <TextField id="reset-email" label="Email address" type="email" autoComplete="email" value={email} error={errors.email} onChange={setEmail} />
      <SubmitButton>Send Reset Link</SubmitButton>
    </form>
  );
}
