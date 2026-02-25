// Provides HR data (employees, departments) to the entire HR section
import { createContext, useContext } from "react";
import { useHRStore } from "../hooks/useHRStore";

const HRContext = createContext(null);

export function HRProvider({ children }) {
  const store = useHRStore();
  return <HRContext.Provider value={store}>{children}</HRContext.Provider>;
}

export function useHR() {
  const ctx = useContext(HRContext);
  if (!ctx) throw new Error("useHR must be used inside <HRProvider>");
  return ctx;
}
