const assert = require("node:assert/strict");
const path = require("node:path");

const reviewState = require(path.resolve(
  __dirname,
  "../website/cultural-map-redesign-stitch-lab/v1-discovery-map/review-state.js",
));

assert.deepEqual(
  reviewState.parse("?mode=paths&path=makers-working-artists&intent=Galleries+%26+Studios"),
  {
    mode: "paths",
    intents: ["Galleries & Studios"],
    place: "",
    path: "makers-working-artists",
    event: "",
  },
  "review state parser should read mode, path, and repeated intent params",
);

assert.deepEqual(
  reviewState.parse("?mode=wat&place=the-center-for-the-arts-grass-valley"),
  {
    mode: "",
    intents: [],
    place: "the-center-for-the-arts-grass-valley",
    path: "",
    event: "",
  },
  "invalid modes should be ignored and left for the app to fall back",
);

assert.equal(
  reviewState.apply("?twilight=true&mode=events&event=old", {
    mode: "places",
    intents: ["See a Show", "Galleries & Studios", "See a Show"],
    place: "nevada-theatre-nevada-city",
  }),
  "?twilight=true&mode=places&intent=Galleries+%26+Studios&intent=See+a+Show&place=nevada-theatre-nevada-city",
  "review state serializer should preserve unrelated params, sort/dedupe intents, and write selected place state",
);

assert.equal(
  reviewState.apply("?mode=places&place=old", {
    mode: "events",
    event: "floralia-2026-05-07",
  }),
  "?mode=events&event=floralia-2026-05-07",
  "review state serializer should only include selected ids that match the active mode",
);

console.log("V1 review state URL contract ok");
