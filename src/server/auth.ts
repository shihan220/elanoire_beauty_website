import { AuthChallengePurpose } from '@prisma/client';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { consumeAuthChallenge, normaliseEmail, verifyAuthChallenge } from './auth-challenges';
import { prisma } from './db';
import { hashPassword, minimumPasswordLength, needsPasswordRehash, verifyPassword } from './password';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        challengeId: { label: 'Verification challenge', type: 'text' },
        code: { label: 'Verification code', type: 'text' },
        flow: { label: 'Auth flow', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email ? normaliseEmail(credentials.email) : '';
        const password = credentials?.password;
        const challengeId = credentials?.challengeId;
        const code = credentials?.code;
        const flow = credentials?.flow;

        if (!email || !password || password.length < minimumPasswordLength || !challengeId || !code) {
          return null;
        }

        if (flow === 'signup') {
          const challengeResult = await verifyAuthChallenge({
            challengeId,
            email,
            purpose: AuthChallengePurpose.SIGN_UP,
            code,
          });

          if (!challengeResult.ok) return null;

          const { challenge } = challengeResult;
          if (!challenge.firstName || !challenge.lastName || !challenge.passwordHash) return null;

          const firstName = challenge.firstName;
          const lastName = challenge.lastName;
          const passwordHash = challenge.passwordHash;
          const passwordMatchesChallenge = await verifyPassword(password, challenge.passwordHash);
          if (!passwordMatchesChallenge) return null;

          const user = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
              where: { email },
              select: { id: true },
            });

            if (existingUser) return null;

            const consumedChallenge = await tx.authChallenge.updateMany({
              where: {
                id: challenge.id,
                consumedAt: null,
              },
              data: { consumedAt: new Date() },
            });

            if (consumedChallenge.count !== 1) return null;

            return tx.user.create({
              data: {
                email,
                firstName,
                lastName,
                passwordHash,
              },
            });
          });

          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) return null;

        const challengeResult = await verifyAuthChallenge({
          challengeId,
          email,
          purpose: AuthChallengePurpose.SIGN_IN,
          code,
        });

        if (!challengeResult.ok || !(await consumeAuthChallenge(challengeResult.challenge))) {
          return null;
        }

        if (needsPasswordRehash(user.passwordHash)) {
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: await hashPassword(password) },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};

export function getCurrentSession() {
  return getServerSession(authOptions);
}
