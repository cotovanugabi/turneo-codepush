import { createContext, useContext, useState } from "react";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AppleIcon,
  BugIcon,
  CheckCircleIcon,
  XCircleIcon,
  RocketIcon,
  InfoIcon,
  DownloadIcon,
  PencilIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell } from "recharts";
import { RadialProgress } from "@/components/ui/radial-progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  selectedApp: string;
  setSelectedApp: (app: string) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined
);

function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      "useEnvironment must be used within an EnvironmentContext.Provider"
    );
  }
  return context;
}

function LayoutComponent() {
  const { data: apps } = useSuspenseQuery(appsQueryOptions);

  const [environment, setEnvironment] = useState("production");
  const [selectedApp, setSelectedApp] = useState(apps[0] || "");
  const contextValue = {
    environment,
    setEnvironment,
    selectedApp,
    setSelectedApp,
  };

  return (
    <EnvironmentContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen>
        <div className="flex h-screen min-w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </EnvironmentContext.Provider>
  );
}

function AppSidebar() {
  const { data: apps } = useSuspenseQuery(appsQueryOptions);
  const { data: releases } = useSuspenseQuery(releasesQueryOptions);
  const { environment, setEnvironment, selectedApp, setSelectedApp } =
    useEnvironment();

  // Sort releases by upload_time in descending order
  const sortedReleases = [...releases].sort(
    (a, b) => b.upload_time - a.upload_time
  );

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={selectedApp} onValueChange={setSelectedApp}>
              <SelectTrigger className="bg-transparent hover:bg-accent focus:ring-0">
                <SelectValue placeholder="Select App" />
              </SelectTrigger>
              <SelectContent>
                {apps.map((app) => (
                  <SelectItem key={app} value={app}>
                    <span className="flex items-center">
                      {app.toLowerCase().includes("ios") ? (
                        <AppleIcon className="mr-2 h-4 w-4" />
                      ) : (
                        <BugIcon className="mr-2 h-4 w-4" />
                      )}
                      {app}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Environment</SidebarGroupLabel>
          <SidebarGroupContent>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="bg-transparent hover:bg-accent focus:ring-0">
                <SelectValue placeholder="Environment">
                  <span className="flex items-center">
                    {environment === "production" ? (
                      <RocketIcon className="mr-2 h-4 w-4 text-red-600" />
                    ) : (
                      <BugIcon className="mr-2 h-4 w-4 text-yellow-600" />
                    )}
                    {environment.charAt(0).toUpperCase() + environment.slice(1)}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">
                  <span className="flex items-center">
                    <RocketIcon className="mr-2 h-4 w-4 text-red-600" />
                    Production
                  </span>
                </SelectItem>
                <SelectItem value="staging">
                  <span className="flex items-center">
                    <BugIcon className="mr-2 h-4 w-4 text-yellow-600" />
                    Staging
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Releases</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-340px)]">
              <SidebarMenu className="gap-1">
                {sortedReleases.map((release, index) => (
                  <SidebarMenuItem key={index}>
                    <Link
                      to="/releases/$releaseId"
                      params={{ releaseId: release.label }}
                      className={cn(
                        "flex items-center w-full py-3 px-3 gap-3",
                        "rounded-md",
                        "transition-colors",
                        release.is_disabled && "opacity-50"
                      )}
                      activeProps={{
                        className: "bg-accent text-accent-foreground",
                      }}
                    >
                      <div className="flex-shrink-0">
                        {release.is_disabled ? (
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircleIcon
                              className="h-4 w-4 text-destructive"
                              aria-label="Disabled"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircleIcon
                              className="h-4 w-4 text-green-600"
                              aria-label="Enabled"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {release.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(release.upload_time)}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground text-right flex-shrink-0">
                        <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ring-muted-foreground/10">
                          {release.target_binary_range}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const releaseRoute = createRoute({
  getParentRoute: () => layoutRoute,
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
  const { data: metrics } = useSuspenseQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await fetch("/metrics");
      return response.json();
    },
  });

  if (!release) {
    return null;
  }

  // Find metrics for current release
  const releaseMetrics = metrics?.find(
    (m: any) => m.label === release.label
  ) || {
    active: 0,
    installed: 0,
    downloaded: 0,
    failed: 0,
  };

  // Calculate percentage of active users
  const activePercentage =
    releaseMetrics.installed > 0
      ? (releaseMetrics.active / releaseMetrics.installed) * 100
      : 0;

  const ROLLOUT_DATA = [
    { name: "Rollout", value: release.rollout },
    { name: "Remaining", value: 100 - release.rollout },
  ];

  const ACTIVE_DATA = [
    { name: "Active", value: activePercentage },
    { name: "Inactive", value: 100 - activePercentage },
  ];

  const COLORS = {
    rollout: {
      primary: "hsl(142.1 76.2% 36.3%)",
      secondary: "hsl(142.1 76.2% 36.3% / 0.2)",
    },
    active: {
      primary: "hsl(199 89% 48%)",
      secondary: "hsl(199 89% 48% / 0.2)",
    },
  };

  // Format the timestamp
  const releaseDate = new Date(release.upload_time);
  const formattedDate = releaseDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = releaseDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{release.label}</h1>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit 'v{release.label}'</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetVersions">
                      Target Versions <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="targetVersions"
                      defaultValue={release.target_binary_range}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description:</Label>
                    <Textarea
                      id="description"
                      className="mt-1.5 min-h-[120px]"
                      placeholder="Styling with Markdown is supported. 5000 characters or less."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Enabled:</Label>
                    <Switch
                      id="enabled"
                      defaultChecked={!release.is_disabled}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    When disabled, this update will not be available to your
                    users.
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="required">Required Update:</Label>
                    <Switch id="required" defaultChecked={true} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Rollout:</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Input
                        type="number"
                        defaultValue="100"
                        className="w-24"
                      />
                      <span>%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1.5">
                      The percentage of users eligible for this update (value
                      can only be increased).
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="secondary">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download Bundle
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">
                <RocketIcon className="mr-2 h-4 w-4" />
                Promote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Promote '{release.label}' to a different deployment
                </DialogTitle>
                <DialogDescription>
                  Select the deployment you want to release this update to.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Select defaultValue="staging">
                    <SelectTrigger>
                      <SelectValue placeholder="Select deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button>Promote</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Rollout Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROLLOUT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="relative w-[240px] h-[240px]">
                <PieChart width={240} height={240}>
                  <Pie
                    data={ROLLOUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={82}
                    outerRadius={96}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {ROLLOUT_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? COLORS.rollout.primary
                            : COLORS.rollout.secondary
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold leading-6">
                      {release.rollout}%
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {release.rollout === 100 ? "All users" : "of users"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ACTIVE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="relative w-[240px] h-[240px]">
                <PieChart width={240} height={240}>
                  <Pie
                    data={ACTIVE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={82}
                    outerRadius={96}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {ACTIVE_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? COLORS.active.primary
                            : COLORS.active.secondary
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-semibold leading-6">
                      {activePercentage.toFixed(2)}%
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {releaseMetrics.active} of {releaseMetrics.installed}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-muted border-0">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-semibold">
              {releaseMetrics.failed}
            </div>
            <div className="text-sm text-muted-foreground mt-1.5">
              Rollbacks
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted border-0">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-semibold">
              {releaseMetrics.installed}
            </div>
            <div className="text-sm text-muted-foreground mt-1.5">Installs</div>
          </CardContent>
        </Card>
        <Card className="bg-muted border-0">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-semibold">
              {releaseMetrics.downloaded}
            </div>
            <div className="text-sm text-muted-foreground mt-1.5">
              Downloads
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Release Info */}
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium">Released On</div>
          <div className="mt-1">
            {formattedDate} at {formattedTime}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">Released By</div>
          <div className="mt-1 flex items-center">
            <div className="h-6 w-6 rounded-full bg-gray-200 mr-2" />
            {release.released_by}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">Release Method</div>
          <div className="mt-1">{release.release_method}</div>
        </div>
        <div>
          <div className="text-sm font-medium">Package Size</div>
          <div className="mt-1">
            {(release.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="text-sm font-medium mb-2">DESCRIPTION</div>
        <div className="text-muted-foreground">-</div>
      </div>
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
      const releases = await queryClient.ensureQueryData(releasesQueryOptions);
      if (releases.length > 0) {
        throw router.navigate({
          to: "/releases/$releaseId",
          params: { releaseId: releases[0].label },
        });
      }
    }
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([releaseRoute, indexRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: { queryClient },
});
