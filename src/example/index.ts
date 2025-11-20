import { ServiceWorkerLoader } from "../main/mod.ts";

addEventListener("load", ServiceWorkerLoader("/worker.js"));
