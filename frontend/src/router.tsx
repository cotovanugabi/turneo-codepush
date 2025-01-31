import { createContext, useContext, useState } from "react";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  useParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppleIcon, BugIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  appsQueryOptions,
  queryClient,
  releasesQueryOptions,
} from "./lib/client";
import { Release } from "./types";

const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>Page not found</p>
        <Link to="/">Go Home</Link>
      </div>
    );
  },
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: LayoutComponent,
});

interface EnvironmentContextType {
  environment: string;
  setEnvironment: (env: string) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined
);

function LayoutComponent() {
  const { appId } = useParams({ from: "/layout/apps/$appId" });
  const [environment, setEnvironment] = useState("production");

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment }}>
      <SidebarProvider defaultOpen>
        <div className="flex h-screen min-w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <header className="h-14 border-b flex items-center justify-between gap-2 px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink>Apps</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink className="text-muted-foreground">
                        {appId}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <Select
                defaultValue="production"
                onValueChange={(value) => setEnvironment(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                </SelectContent>
              </Select>
            </header>
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </EnvironmentContext.Provider>
  );
}

function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      "useEnvironment must be used within an EnvironmentContext.Provider"
    );
  }
  return context;
}

function AppSidebar() {
  const { data } = useSuspenseQuery(appsQueryOptions);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.map((app) => (
                <SidebarMenuItem key={app}>
                  <SidebarMenuButton asChild className="w-full">
                    <Link
                      to="/apps/$appId"
                      params={{ appId: app }}
                      className={cn(
                        "flex items-center w-full",
                        "rounded-md",
                        "transition-colors"
                      )}
                      activeProps={{
                        className:
                          "bg-accent text-accent-foreground font-medium",
                      }}
                    >
                      {app.toLowerCase().includes("ios") ? (
                        <AppleIcon className="mr-2 h-4 w-4" />
                      ) : (
                        <BugIcon className="mr-2 h-4 w-4" />
                      )}
                      <span>{app}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const appsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "apps",
  beforeLoad: async ({ context: { queryClient }, location }) => {
    // Redirect to first app if we're at /apps
    if (location.pathname === "/apps") {
      const apps = queryClient.getQueryData<string[]>(["apps"]);
      if (apps && apps.length > 0) {
        throw router.navigate({
          to: "/apps/$appId",
          params: { appId: apps[0] },
        });
      }
    }
  },
});

const appRoute = createRoute({
  getParentRoute: () => appsRoute,
  path: "$appId",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(releasesQueryOptions),
  component: AppComponent,
});

function AppComponent() {
  const { data: releases } = useSuspenseQuery(releasesQueryOptions);
  const { appId } = useParams({ from: "/layout/apps/$appId" });
  const { environment } = useEnvironment();

  return (
    <div className="flex h-full">
      <Card className="w-80 rounded-none border-r border-t-0 border-b-0 border-l-0">
        <ScrollArea className="h-[calc(100vh-48px)]">
          <div className="space-y-1 p-2">
            {releases.map((release, index) => (
              <Link
                key={index}
                to="/apps/$appId/releases/$releaseId"
                params={{ appId, releaseId: release.label }}
                className={cn(
                  "flex items-center w-full p-2 rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors"
                )}
                activeProps={{
                  className: "bg-accent text-accent-foreground",
                }}
              >
                <div>
                  <div className="font-medium">{release.label}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {release.target_binary_range}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </Card>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

const releaseRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "releases/$releaseId",
  loader: async ({ context: { queryClient }, params: { releaseId } }) => {
    await queryClient.ensureQueryData(releasesQueryOptions);
    const releases = queryClient.getQueryData<Release[]>(["releases"]);
    const release = releases?.find((r) => r.label === releaseId);
    return { release };
  },
  component: ReleaseComponent,
});

function ReleaseComponent() {
  const { release } = releaseRoute.useLoaderData();

  if (!release) {
    return null;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{release.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-7">{release.target_binary_range}</p>
        </CardContent>
      </Card>
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(appsQueryOptions);
    const apps = queryClient.getQueryData<string[]>(["apps"]);
    if (apps && apps.length > 0) {
      throw router.navigate({
        to: "/apps/$appId",
        params: { appId: apps[0] },
      });
    }
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    appsRoute.addChildren([appRoute.addChildren([releaseRoute])]),
    indexRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: { queryClient },
});
