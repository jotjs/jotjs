import { format, increment, parse, type ReleaseType } from "@std/semver";
import json from "../../deno.json" with { type: "json" };

const { args, writeTextFile } = Deno;

if (import.meta.main) {
  const liveVersion = parse(json.version);
  const nextVersion = increment(liveVersion, <ReleaseType>args[0]);

  json.version = format(nextVersion);

  const data = JSON.stringify(json);

  await writeTextFile("deno.json", data);
}
