import { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);
  const showError = useCallback((msg) => setError(msg), []);
  const clearError = useCallback(() => setError(null), []);

  const withLoading = useCallback(
    async (fn) => {
      try {
        showLoading();
        const result = await fn();
        hideLoading();
        return result;
      } catch (err) {
        showError(err.message || "An error occurred");
        hideLoading();
        throw err;
      }
    },
    [showLoading, hideLoading, showError]
  );

  const value = {
    isLoading,
    error,
    showLoading,
    hideLoading,
    showError,
    clearError,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading() must be used inside <LoadingProvider>");
  }
  return ctx;
}
