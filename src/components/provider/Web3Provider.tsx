"use client";

import { createContext, type FC, type ReactNode, useContext } from "react";
import { type IWeb3State, useWeb3Provider } from "~/hooks/useWeb3Provider";

export interface IWeb3Context {
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  state: IWeb3State;
}

const Web3Context = createContext<IWeb3Context | null>(null);

type Props = {
  children: ReactNode;
};

const Web3ContextProvider: FC<Props> = ({ children }) => {
  const { connectWallet, disconnect, state } = useWeb3Provider();

  return (
    <Web3Context.Provider
      value={{
        connectWallet: connectWallet as () => Promise<void>,
        disconnect,
        state,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3ContextProvider;

export const useWeb3Context = () => useContext(Web3Context);
