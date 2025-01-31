import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
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

class NotFoundError extends Error {}

const fetchApps = async () => {
  console.info("Fetching apps...");
  await new Promise((r) => setTimeout(r, 500));
  return ["Turneo-iOS", "Turneo-Android"];
};

const fetchReleases = async () => {
  console.info("Fetching releases...");
  await new Promise((r) => setTimeout(r, 500));
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then((r) => r.json())
    .then((r) => r.slice(0, 10));
};

const fetchRelease = async (releaseId: string) => {
  console.info(`Fetching release with id ${releaseId}...`);
  await new Promise((r) => setTimeout(r, 500));
  const release = fetch(
    `https://jsonplaceholder.typicode.com/posts/${releaseId}`
  )
    .then((r) => r.json())
    .then((r) => r);

  if (!release) {
    throw new NotFoundError(`Release with id "${releaseId}" not found!`);
  }

  return release;
};

const rootRoute = createRootRoute({
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
  loader: async ({ params }: { params: { appId: string } }) => {
    const apps = await fetchApps();
    return { apps, appId: params.appId };
  },
});

function AppSidebar() {
  const { apps } = layoutRoute.useLoaderData();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {apps.map((app) => (
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

function LayoutComponent() {
  const { appId } = layoutRoute.useLoaderData();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen min-w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center gap-2 px-4">
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
          </header>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

const appsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "apps",
  loader: async () => {
    const apps = await fetchApps();
    return { apps };
  },
  beforeLoad: async ({ context, location }) => {
    // Redirect to first app if we're at /apps
    if (location.pathname === "/apps") {
      const apps = await fetchApps();
      if (apps.length > 0) {
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
  loader: async ({ params: { appId } }) => {
    const releases = await fetchReleases();
    return { releases, appId };
  },
  component: AppComponent,
});

function AppComponent() {
  const { releases, appId } = appRoute.useLoaderData();

  return (
    <div className="flex h-full">
      <Card className="w-80 rounded-none border-r border-t-0 border-b-0 border-l-0">
        <ScrollArea className="h-[calc(100vh-48px)]">
          <div className="space-y-1 p-2">
            {releases.map((release) => (
              <Link
                key={release.id}
                to="/apps/$appId/releases/$releaseId"
                params={{ appId, releaseId: release.id.toString() }}
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
                  <div className="font-medium">{release.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {release.body}
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
  loader: async ({ params: { releaseId } }) => {
    const release = await fetchRelease(releaseId);
    return { release };
  },
  component: ReleaseComponent,
});

function ReleaseComponent() {
  const { release } = releaseRoute.useLoaderData();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{release.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-7">{release.body}</p>
        </CardContent>
      </Card>
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    const apps = await fetchApps();
    if (apps.length > 0) {
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
});
