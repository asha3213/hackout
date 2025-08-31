import React, { createContext, useContext, useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  role: string;
  public_key_pem: string;
}

interface AppState {
  currentAccount: Account | null;
  accounts: Account[];
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setCurrentAccount: (account: Account | null) => void;
  setAccounts: (accounts: Account[]) => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentAccount: null,
    accounts: [],
    isLoading: false,
  });

  const setCurrentAccount = (account: Account | null) => {
    setState(prev => ({ ...prev, currentAccount: account }));
  };

  const setAccounts = (accounts: Account[]) => {
    setState(prev => ({ ...prev, accounts }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentAccount,
      setAccounts,
      setLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}