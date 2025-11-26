import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  consent: boolean;
  setConsent: (consent: boolean) => void;
  generateUserId: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const generateUserId = () => {
    const id = `anon_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(id);
    return id;
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, consent, setConsent, generateUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
