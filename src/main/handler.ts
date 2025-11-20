export type Handler<R = void | PromiseLike<void>> = { (event: FetchEvent): R };

export function Group(...handlers: Handler[]): Handler {
  return async (event) => {
    for (const handler of handlers) {
      await handler(event);
    }
  };
}
