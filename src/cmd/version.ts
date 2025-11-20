import json from "../../deno.json" with { type: "json" };

if (import.meta.main) {
  console.log(json.version);
}
