"use client";

import { signOut } from "next-auth/react";

const SignOutButton = () => {
  return (
    <button
      className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-sm"
      onClick={() => {
        void signOut();
      }}
    >
      退出登录
    </button>
  );
};

export default SignOutButton;
