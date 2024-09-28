"use client";

import WalletLoginButton from "~/components/WalletButton";
import { useSession } from "next-auth/react";
import SignOutButton from "~/components/SignOutButton";

const HomePage = () => {
  const { data: session } = useSession();
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Home Page</h1>
      {session ? (
        <div>
          <p>Connected as {session.user.name}</p>
          <SignOutButton />
        </div>
      ) : (
        <WalletLoginButton />
      )}
    </div>
  );
};

export default HomePage;
