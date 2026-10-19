export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  /** Optional user-facing detail (safe to show in the app). */
  readonly detail?: string;

  constructor(status: number, code: string, detail?: string) {
    super(detail ?? code);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
