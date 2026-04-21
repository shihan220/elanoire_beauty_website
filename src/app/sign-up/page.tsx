import { AuthPageShell } from '../components/auth/AuthPageShell';
import { SignUpForm } from '../components/auth/AuthForms';

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Create Account"
      title="Begin a more personal Élanoire experience."
      description="Save your details, revisit your order history, and build a considered routine across skincare and makeup."
      asideTitle="Already registered?"
      asideText="Sign in to continue with your saved account details and manage your preferences."
      asideLinkHref="/sign-in"
      asideLinkLabel="Sign In"
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
