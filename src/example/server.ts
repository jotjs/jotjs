import { copy, emptyDir } from "@std/fs";
import { context } from "esbuild";

const dist = "dist/example";

await emptyDir(dist);
await copy("src/example/index.html", `${dist}/index.html`);

const server = await (
  await context({
    platform: "neutral",
    bundle: true,
    entryPoints: ["src/example/index.ts"],
    outdir: dist,
  })
).serve({
  servedir: dist,
  host: "127.0.0.1",
  port: 8080,
});

console.log(`http://${server.host}:${server.port}`);
