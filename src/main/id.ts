let value = 0n;

/**
 *
 * @returns
 */
export function id(): { id: string } {
  const id = String(value++);

  return Object.assign(
    { id },
    {
      [Symbol.toPrimitive]() {
        return id;
      },
    },
  );
}
