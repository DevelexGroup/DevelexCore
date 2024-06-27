/**
 * Represents an error that occurres in main abstract class {@link ETInput}.
 * It is thrown when high-level errors occur in the input adapter.
 * @category Error
 */

export class ETInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ETInputError";
  }
}