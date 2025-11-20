import { Component } from "./component.ts";
import { Group, type Handler } from "./handler.ts";
import { Reply } from "./server.ts";

export const noContentReply: Handler = Reply(null, { status: 204 });

export function Booster(booster: Handler, fallback: Handler): Handler {
  let clientId: string;

  return Component((event) => {
    if (clientId === event.clientId) {
      return Group(booster, noContentReply);
    }

    clientId = event.resultingClientId;

    return fallback;
  });
}
