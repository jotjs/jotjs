let context = document;

/**
 *
 * @returns
 */
export function getDocument(): Document {
  return context;
}

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  context = document;
}
