import { HttpError } from './HttpError';

/** Parses a JSON request body; malformed JSON is a client error (400), not a 500. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'invalid_json');
  }
}
