import { emptyDir } from "@std/fs";
import { build, type BuildOptions } from "esbuild";

const dist = "dist";

const options: BuildOptions = {
  bundle: true,
  sourcemap: true,
  platform: "neutral",
  entryPoints: ["src/main/mod.ts"],
};

await emptyDir(dist);
await build({ ...options, outfile: `${dist}/jot.js` });
await build({ ...options, outfile: `${dist}/jot.min.js`, minify: true });
await build({
  ...options,
  outfile: `${dist}/jot.core.js`,
  entryPoints: ["src/main/core.ts"],
});
await build({
  ...options,
  outfile: `${dist}/jot.core.min.js`,
  entryPoints: ["src/main/core.ts"],
  minify: true,
});
