import { copy, emptyDir } from "jsr:@std/fs";
import { context } from "npm:esbuild";

const dist = "dist";

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
