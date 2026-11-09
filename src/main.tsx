import { applicationRoute } from "./lib/applicationRoute";

if (applicationRoute(window.location.pathname, window.location.search) === "fair") {
  void import("./fair-entry");
} else {
  void import("./original-entry");
}
