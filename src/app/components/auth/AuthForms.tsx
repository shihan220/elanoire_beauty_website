'use client';

import Link from 'next/link';
import { ArrowRight, Check, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type Errors = Record<string, string>;
type ApiErrors = Record<string, string | string[]>;
type AuthStep = 'details' | 'code';

type TextFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'email' | 'numeric' | 'search' | 'text';
  maxLength?: number;
  showPasswordToggle?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

const minimumPasswordLength = 8;

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<{
    message?: string;
    errors?: ApiErrors;
    challengeId?: string;
    devCode?: string;
    retryAfterSeconds?: number;
  }>;
}

function normaliseErrors(errors?: ApiErrors) {
  if (!errors) return {};

  return Object.entries(errors).reduce<Errors>((normalisedErrors, [key, value]) => {
    normalisedErrors[key] = Array.isArray(value) ? value[0] : value;

    return normalisedErrors;
  }, {});
}

function TextField({
  id,
  label,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength,
  showPasswordToggle = false,
  value,
  error,
  onChange,
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = showPasswordToggle && isPasswordVisible ? 'text' : type;

  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 block">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-transparent border-0 border-b border-stone-300 px-0 py-4 text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-900 transition-colors ${
            showPasswordToggle ? 'pr-12' : ''
          }`}
        />
        {showPasswordToggle ? (
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-900 transition-colors"
          >
            {isPasswordVisible ? (
              <EyeOff size={18} strokeWidth={1.5} />
            ) : (
              <Eye size={18} strokeWidth={1.5} />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-3 text-sm text-[var(--elanoire-color-destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-stone-900 text-[#faf9f6] py-4 px-8 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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

function CodeNotice({ devCode }: { devCode?: string }) {
  return (
    <div className="border border-stone-300 bg-[#faf9f6] p-6">
      <p className="text-sm leading-relaxed text-stone-600">
        Enter the six-digit verification code sent for this account.
      </p>
      {devCode ? (
        <>
          <p className="mt-4 text-xs tracking-[0.2em] uppercase text-stone-500">
            Local Test Code: {devCode}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            Local mail capture is active. Use this code while real SMTP delivery is not configured.
          </p>
        </>
      ) : null}
    </div>
  );
}

function getCodeRequestMessage(data: Awaited<ReturnType<typeof readJson>>, fallback: string) {
  if (data.retryAfterSeconds) {
    return `${data.message ?? fallback} Try again in ${data.retryAfterSeconds} seconds.`;
  }

  return data.message ?? fallback;
}

function ResendCodeButton({
  disabled,
  isLoading,
  message,
  onClick,
}: {
  disabled?: boolean;
  isLoading?: boolean;
  message?: string;
  onClick: () => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={onClick}
        className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw size={14} strokeWidth={1.5} className={isLoading ? 'animate-spin' : ''} />
        {isLoading ? 'Sending Code' : 'Resend Code'}
      </button>
      {message ? (
        <p className="text-sm leading-relaxed text-stone-600" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [devCode, setDevCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function requestSignInCode(isResend = false) {
    const setLoading = isResend ? setIsResending : setIsSubmitting;
    setLoading(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/sign-in/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await readJson(response);

      if (!response.ok || !data.challengeId) {
        const message = getCodeRequestMessage(data, 'We could not send a verification code.');

        if (isResend) {
          setResendMessage(message);
        } else {
          setFormError(message);
        }

        setErrors(normaliseErrors(data.errors));
        return;
      }

      setChallengeId(data.challengeId);
      setDevCode(data.devCode ?? '');
      setCode('');
      setStep('code');
      setErrors({});
      setResendMessage(isResend ? 'A new verification code has been sent.' : '');
    } catch {
      const message = 'Verification code delivery is unavailable. Check the mail configuration and try again.';

      if (isResend) {
        setResendMessage(message);
      } else {
        setFormError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < minimumPasswordLength) nextErrors.password = 'Use at least 8 characters.';
    if (step === 'code' && code.trim().length !== 6) {
      nextErrors.code = 'Enter the six-digit verification code.';
    }

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    if (step === 'details') {
      await requestSignInCode(false);
      return;
    }

    setIsSubmitting(true);

    const result = await signIn('credentials', {
      email,
      password,
      challengeId,
      code,
      flow: 'signin',
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
        showPasswordToggle
      />
      {step === 'code' ? (
        <>
          <CodeNotice devCode={devCode} />
          <TextField
            id="signin-code"
            label="Verification code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            error={errors.code}
            onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          />
          <ResendCodeButton
            disabled={isSubmitting}
            isLoading={isResending}
            message={resendMessage}
            onClick={() => requestSignInCode(true)}
          />
        </>
      ) : null}
      <div className="flex items-center justify-between gap-6">
        <label className="flex items-center gap-3 text-sm text-stone-600">
          <input type="checkbox" className="h-4 w-4 accent-stone-900" />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-sm text-stone-900 border-b border-stone-900 hover:text-stone-500 hover:border-stone-500 transition-colors">
          Forgot password
        </Link>
      </div>
      <SubmitButton disabled={isSubmitting}>
        {isSubmitting ? 'Submitting' : step === 'code' ? 'Verify Sign In' : 'Continue'}
      </SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [devCode, setDevCode] = useState('');
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function requestSignUpCode(isResend = false) {
    const setLoading = isResend ? setIsResending : setIsSubmitting;
    setLoading(true);
    setResendMessage('');

    try {
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
      const data = await readJson(response);

      if (!response.ok || !data.challengeId) {
        const message = getCodeRequestMessage(data, 'We could not send a verification code.');

        if (isResend) {
          setResendMessage(message);
        } else {
          setFormError(message);
        }

        setErrors(normaliseErrors(data.errors));
        return;
      }

      setChallengeId(data.challengeId);
      setDevCode(data.devCode ?? '');
      setCode('');
      setStep('code');
      setErrors({});
      setResendMessage(isResend ? 'A new verification code has been sent.' : '');
    } catch {
      const message = 'Verification code delivery is unavailable. Check the mail configuration and try again.';

      if (isResend) {
        setResendMessage(message);
      } else {
        setFormError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!lastName.trim()) nextErrors.lastName = 'Enter your last name.';
    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < minimumPasswordLength) nextErrors.password = 'Use at least 8 characters.';
    if (!acceptsTerms) nextErrors.terms = 'Confirm you accept the account terms.';
    if (step === 'code' && code.trim().length !== 6) {
      nextErrors.code = 'Enter the six-digit verification code.';
    }

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    if (step === 'details') {
      await requestSignUpCode(false);
      return;
    }

    setIsSubmitting(true);

    const signInResult = await signIn('credentials', {
      email,
      password,
      challengeId,
      code,
      flow: 'signup',
      redirect: false,
    });

    setIsSubmitting(false);

    if (signInResult?.error) {
      setFormError('We could not verify that code. Request a new code and try again.');
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
      <TextField id="password" label="Password" type="password" autoComplete="new-password" value={password} error={errors.password} onChange={setPassword} showPasswordToggle />
      {step === 'code' ? (
        <>
          <CodeNotice devCode={devCode} />
          <TextField
            id="signup-code"
            label="Verification code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            error={errors.code}
            onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          />
          <ResendCodeButton
            disabled={isSubmitting}
            isLoading={isResending}
            message={resendMessage}
            onClick={() => requestSignUpCode(true)}
          />
        </>
      ) : null}
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
      <SubmitButton disabled={isSubmitting}>
        {isSubmitting ? 'Submitting' : step === 'code' ? 'Verify Account' : 'Create Account'}
      </SubmitButton>
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
