import { format, increment, parse, type ReleaseType } from "@std/semver";
import { json, target } from "./version.ts";

if (import.meta.main) {
  json.version = format(
    increment(parse(json.version), Deno.args[0] as ReleaseType),
  );

  await Deno.writeTextFile(target, JSON.stringify(json, undefined, 2));
}
