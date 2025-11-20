import { nil } from "./component.ts";
import { Group, type Handler } from "./handler.ts";
import { Message } from "./message.ts";
import { Redirect } from "./redirect.ts";

type Content = PartialOptions & {
  value: string;
};

export type PartialOptions = Partial<{
  property: string;
  target: string;
  url: string | false;
}>;

const subject = "PARTIAL";

const partialOptions: PartialOptions = {};

export function configurePartial(options: PartialOptions) {
  Object.assign(partialOptions, options);
}

export function getPartialSubject(): object {
  return {
    [subject]({ property, target, value }: Content) {
      const element = document.querySelector(target || "body");

      if (element) {
        Object.assign(element, { [property || "innerHTML"]: value });
      }
    },
  };
}

export function Partial(value?: unknown, options?: PartialOptions): Handler {
  return Group(
    Message({
      subject,
      content: {
        ...partialOptions,
        ...options,
        value: String(value ?? ""),
      },
    }),
    options?.url === false ? nil : Redirect(options?.url),
  );
}
