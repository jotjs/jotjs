const current = { document };

/**
 *
 * @returns
 */
export function getDocument(): Document {
  return current.document;
}

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  current.document = document;
}
