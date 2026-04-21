import { AuthPageShell } from '../components/auth/AuthPageShell';
import { SignInForm } from '../components/auth/AuthForms';

export default function SignInPage() {
  return (
    <AuthPageShell
      eyebrow="Account Access"
      title="Return to your beauty ritual."
      description="Sign in to review your orders, manage your saved details, and keep your curated Élanoire essentials close."
      asideTitle="New to Élanoire?"
      asideText="Create an account for a smoother checkout, saved preferences, and early access to future collection edits."
      asideLinkHref="/sign-up"
      asideLinkLabel="Create Account"
    >
      <SignInForm />
    </AuthPageShell>
  );
}
