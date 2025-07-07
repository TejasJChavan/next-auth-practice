import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "johndoe@gmail.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Add logic here to look up the user from the credentials supplied
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const exisitingUser = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });
                if (!exisitingUser) {
                    return null;
                }

                const passwordMatch = await compare(
                    credentials.password,
                    exisitingUser.password
                );
                if (!passwordMatch) {
                    return null;
                }
                return {
                    id: `${exisitingUser.id}`,
                    username: exisitingUser.username,
                    email: exisitingUser.email,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    username: user.username,
                };
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    username: token.username,
                },
            };
        },
    },
};
