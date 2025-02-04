import { Release } from "@/types";
import { QueryClient, queryOptions } from "@tanstack/react-query";

export const queryClient = new QueryClient();

const fetchApps = async () => {
  console.info("Fetching apps...");
  await new Promise((r) => setTimeout(r, 500));
  return ["Turneo-iOS", "Turneo-Android"];
};

export const appsQueryOptions = queryOptions({
  queryKey: ["apps"],
  queryFn: () => fetchApps(),
});

export const releasesQueryOptions = queryOptions({
  queryKey: ["releases"],
  queryFn: () =>
    fetch("/v0.1/apps/turneoapp/turneo-ios/deployments/Production/releases", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then((r) => r.json()) as Promise<Release[]>,
});
