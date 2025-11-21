import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        })
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    // You can add callbacks, pages, etc. as needed
    callbacks: {
        async session({ session, user }) {
            // Include user.id in session for later use
            if (session.user) {
                // @ts-ignore – we add a custom field
                session.user.id = user.id;
            }
            return session;
        }
    }
};

export default NextAuth(authOptions);
