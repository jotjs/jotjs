import { format, increment, parse, type ReleaseType } from "@std/semver";

const target = "deno.json";

const json = JSON.parse(await Deno.readTextFile(target));

json.version = format(
  increment(parse(json.version), Deno.args[0] as ReleaseType),
);

await Deno.writeTextFile(target, JSON.stringify(json, undefined, 2));
