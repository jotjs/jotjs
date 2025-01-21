let value = 0n;

/**
 *
 */
export interface Id {
  id: string;
}

/**
 *
 * @returns
 */
export function id(): Id {
  return <Id>{
    id: String(value++),
    [Symbol.toPrimitive]() {
      return this.id;
    },
  };
}
