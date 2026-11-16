import { applicationRoute } from "./lib/applicationRoute";

if (/^\/experiencia\/yamilook(?:\/|$)/.test(window.location.pathname)) {
  void import("./yamilook-experience/entry");
} else if (/^\/experiencia(?:\/|$)/.test(window.location.pathname)) {
  void import("./experience/entry");
} else if (applicationRoute(window.location.pathname, window.location.search) === "fair") {
  void import("./fair-entry");
} else {
  void import("./original-entry");
}
