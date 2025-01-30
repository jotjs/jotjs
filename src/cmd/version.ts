export const target = "deno.json";

export const json = JSON.parse(await Deno.readTextFile(target));

if (import.meta.main) {
  console.log(json.version);
}
