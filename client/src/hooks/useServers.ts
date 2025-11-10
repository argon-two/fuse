import { useQuery } from "@tanstack/react-query";
import { getServers, getServerDetail } from "../api/servers";

export function useServers() {
  return useQuery({
    queryKey: ["servers"],
    queryFn: getServers,
  });
}

export function useServerDetail(slug?: string) {
  return useQuery({
    queryKey: ["server", slug],
    queryFn: () => {
      if (!slug) {
        return Promise.reject(new Error("no-slug"));
      }
      return getServerDetail(slug);
    },
    enabled: Boolean(slug),
  });
}
