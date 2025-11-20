import type { Handler } from "./handler.ts";

export type Message = {
  content?: unknown;
  subject: string;
};

declare const clients: Clients;

export function Message(message: Message): Handler {
  return async (event) =>
    (await clients.get(event.clientId))?.postMessage(message);
}
