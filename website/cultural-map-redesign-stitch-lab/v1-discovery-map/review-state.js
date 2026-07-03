(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.V1ReviewState = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VALID_MODES = new Set(["places", "events", "paths", "trails"]);

  function parse(search) {
    const params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
    const mode = VALID_MODES.has(params.get("mode")) ? params.get("mode") : "";
    return {
      mode,
      intents: params.getAll("intent").filter(Boolean),
      place: params.get("place") || "",
      path: params.get("path") || "",
      event: params.get("event") || "",
    };
  }

  function apply(urlSearch, reviewState) {
    const params = new URLSearchParams(String(urlSearch || "").replace(/^\?/, ""));
    ["mode", "intent", "place", "path", "event"].forEach((key) => params.delete(key));
    const mode = VALID_MODES.has(reviewState.mode) ? reviewState.mode : "places";
    params.set("mode", mode);
    [...new Set(reviewState.intents || [])].filter(Boolean).sort().forEach((intent) => {
      params.append("intent", intent);
    });
    // A selected trail is a place record, so the Trails lens shares via the
    // same place param.
    if ((mode === "places" || mode === "trails") && reviewState.place) params.set("place", reviewState.place);
    if (mode === "paths" && reviewState.path) params.set("path", reviewState.path);
    if (mode === "events" && reviewState.event) params.set("event", reviewState.event);
    const next = params.toString();
    return next ? `?${next}` : "";
  }

  return { parse, apply };
});
