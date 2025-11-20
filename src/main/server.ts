import type { Handler } from "./handler.ts";

const responses = new WeakMap<FetchEvent, Response>();

function Request(handler: Handler): Handler<PromiseLike<Response>> {
  return async (event) => {
    await handler(event);

    return responses.get(event) || fetch(event.request);
  };
}

export function Reply(body?: BodyInit | null, init?: ResponseInit): Handler {
  return Forward(new Response(body, init));
}

export function Forward(response: Response | PromiseLike<Response>): Handler {
  return async (event: FetchEvent) => {
    responses.set(event, (await response).clone());
  };
}

export function Server(handler: Handler): Handler {
  const responseTo = Request(handler);

  return (event) => event.respondWith(responseTo(event));
}
