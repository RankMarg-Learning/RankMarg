import api from "@/utils/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(r => r.data.data);

export function useUser() {
  const { data: user, error, mutate } = useSWR("/auth/profile", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60000, // 1 minute
  });
  return {
    user,
    isLoading: !error && !user,
    isError: !!error,
    mutate,
  };
}