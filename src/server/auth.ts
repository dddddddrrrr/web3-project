import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string | undefined | null;
      image: string | undefined | null;
      btcWalletAddress: string | undefined | null;
      ethWalletAddress: string | undefined | null;
      walletChainId: string | undefined | null;
      walletProvider: string | undefined | null;
      role: number | undefined | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | undefined | null;
    image: string | undefined | null;
    btcWalletAddress: string | undefined | null;
    ethWalletAddress: string | undefined | null;
    walletChainId: string | undefined | null;
    walletProvider: string | undefined | null;
    role: number | undefined | null;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.image as string;
        session.user.role = token.role as number;
        session.user.btcWalletAddress = token.btcWalletAddress as string;
        session.user.ethWalletAddress = token.ethWalletAddress as string;
        session.user.walletChainId = token.walletChainId as string;
        session.user.walletProvider = token.walletProvider as string;
      }
      return session;
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;

        if (user.ethWalletAddress) {
          token.ethWalletAddress = user.ethWalletAddress;
          token.ethWalletChainId = user.walletChainId;
          token.ethWalletProvider = user.walletProvider;
        }
        if (user.btcWalletAddress) {
          token.btcWalletAddress = user.btcWalletAddress;
          token.walletChainId = user.walletChainId;
          token.walletProvider = user.walletProvider;
        }
      }

      return token;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl + "/api/auth/signout")) {
        return baseUrl;
      }

      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 2592000 * 2,
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      id: "web3",
      name: "web3",
      credentials: {
        ethWalletAddress: { label: "Ethereum Wallet Address", type: "text" },
        btcWalletAddress: { label: "Bitcoin Wallet Address", type: "text" },
        walletChainId: { label: "Wallet ChainId", type: "text" },
        walletProvider: { label: "Wallet Provider", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }
        const {
          ethWalletAddress,
          btcWalletAddress,
          walletChainId,
          walletProvider,
        } = credentials;

        if (
          !ethWalletAddress ||
          !btcWalletAddress ||
          !walletChainId ||
          !walletProvider
        ) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findFirst({
          where: { ethAddress: ethWalletAddress },
        });

        if (!user) {
          throw new Error("User not found");
        }

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          btcWalletAddress: user.btcAddress ?? null,
          ethWalletAddress: user.ethAddress ?? null,
          walletChainId: user.walletChainId ?? null,
          walletProvider: user.walletProvider ?? null,
          role: user.role ?? null,
        };
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
