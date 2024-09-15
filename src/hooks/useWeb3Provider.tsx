"use client";
import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { ethers } from "ethers";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (...args: any[]) => void,
  ) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface IWeb3State {
  address: string | null;
  currentChain: number | null;
  signer: ethers.Signer | null;
  provider: ethers.providers.Web3Provider | null;
  isAuthenticated: boolean;
}

interface ToastMessage {
  status: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
}

interface Web3ContextType {
  state: IWeb3State;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  toastMessage: ToastMessage | null;
  clearToast: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3Provider = () => {
  const initialWeb3State: IWeb3State = useMemo(
    () => ({
      address: null,
      currentChain: null,
      signer: null,
      provider: null,
      isAuthenticated: false,
    }),
    [],
  );

  const [state, setState] = useState<IWeb3State>(initialWeb3State);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: ToastMessage) => {
    setToastMessage(message);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const connectWallet = useCallback(async () => {
    if (state.isAuthenticated) return;

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        showToast({
          status: "error",
          title: "Error",
          description: "No ethereum wallet found",
        });
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chain = network.chainId;

      setState((prevState) => ({
        ...prevState,
        address,
        signer,
        currentChain: chain,
        provider,
        isAuthenticated: true,
      }));

      localStorage.setItem("isAuthenticated", "true");

      showToast({
        status: "success",
        title: "Connected",
        description: "Wallet connected successfully",
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      showToast({
        status: "error",
        title: "Error",
        description: "Failed to connect wallet",
      });
    }
  }, [state.isAuthenticated, showToast]);

  const disconnect = useCallback(() => {
    setState(initialWeb3State);
    localStorage.removeItem("isAuthenticated");
    showToast({
      status: "info",
      title: "Disconnected",
      description: "Wallet disconnected",
    });
  }, [showToast, initialWeb3State]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem("isAuthenticated") === "true") {
      void connectWallet();
    }
  }, [connectWallet]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setState((prevState) => ({
        ...prevState,
        address: accounts[0] ?? null,
      }));
    };

    const handleChainChanged = (chainId: string) => {
      setState((prevState) => ({
        ...prevState,
        currentChain: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    connectWallet,
    disconnect,
    state,
    toastMessage,
    clearToast,
  };
};

export function Web3ProviderWrapper({ children }: { children: ReactNode }) {
  const web3ProviderValue = useWeb3Provider();

  return (
    <Web3Context.Provider value={web3ProviderValue}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3Context must be used within a Web3ProviderWrapper");
  }
  return context;
}
