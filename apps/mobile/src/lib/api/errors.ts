export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** Optional user-facing detail from the API `message` field. */
  readonly detail?: string;

  constructor(status: number, code: string, detail?: string) {
    super(detail ?? code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
