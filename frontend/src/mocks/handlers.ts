import { http, HttpResponse } from "msw";
import metricsData from "./data/metrics.json";
import releasesData from "./data/releases.json";

export const handlers = [
  http.get("/metrics", () => {
    return HttpResponse.json(metricsData);
  }),

  http.get("/releases", () => {
    return HttpResponse.json(releasesData);
  }),
];
