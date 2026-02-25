import { useState, useEffect } from "react";

/**
 * @param {Function} apiFn - Async function that returns API call promise
 * @param {any[]} dependencies - Dependency array (like useEffect)
 * @returns {{ data: any, loading: boolean, error: string | null }}
 */
export function useAPIData(apiFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

export default useAPIData;
