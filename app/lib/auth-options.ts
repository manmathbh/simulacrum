import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const requiredAuthEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

function logMissingAuthEnvVarsOnce() {
  if ((globalThis as { __authEnvChecked?: boolean }).__authEnvChecked) {
    return;
  }

  const missing = requiredAuthEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[auth] Missing environment variables: ${missing.join(", ")}. ` +
        "Google sign-in may fail until these are configured.",
    );
  }

  (globalThis as { __authEnvChecked?: boolean }).__authEnvChecked = true;
}

logMissingAuthEnvVarsOnce();

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};
