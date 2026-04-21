import { AuthPageShell } from '../components/auth/AuthPageShell';
import { ForgotPasswordForm } from '../components/auth/AuthForms';

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Password Care"
      title="Reset your account access."
      description="Enter the email address linked to your account and we will prepare a secure reset flow for backend email delivery."
      asideTitle="Remembered your password?"
      asideText="Return to sign in and continue managing your account, orders, and saved preferences."
      asideLinkHref="/sign-in"
      asideLinkLabel="Back To Sign In"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
