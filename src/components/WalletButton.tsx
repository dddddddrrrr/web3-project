"use client";

import { signIn } from "next-auth/react";
import { useWeb3Context } from "~/components/provider/Web3Provider";
import { Button } from "./ui/button";

const WalletLoginButton = () => {
  const context = useWeb3Context();
  if (!context) {
    console.error("Web3 context is not available");
    return null;
  }
  const { connectWallet, state } = context || {};

  const handleLogin = async () => {
    if (connectWallet) {
      await connectWallet();
    }

    const { address, currentChain, provider } = state;

    if (address && currentChain && provider) {
      try {
        const network = await provider.getNetwork();
        const walletProvider = network.name || "unknown";


        await signIn("web3", {
          ethWalletAddress: address,
          btcWalletAddress: "",
          walletChainId: currentChain.toString(),
          walletProvider,
        });
      } catch (error) {
        console.error("Error getting network:", error);
      }
    } else {
      console.error("缺少钱包信息");
    }
  };

  return (
    <Button onClick={handleLogin} className="">
      连接钱包
    </Button>
  );
};

export default WalletLoginButton;
