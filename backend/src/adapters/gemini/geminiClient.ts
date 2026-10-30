export type GeminiUsageMeta = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
};

export type GeminiGenerateResult = {
  text: string;
  usage: GeminiUsageMeta;
  model: string;
};

export type GeminiClientConfig = {
  apiKey: string;
  model: string;
  apiBaseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  temperature?: number;
  fetchImpl?: typeof fetch;
};

export type GeminiGenerateRequest = {
  prompt: string;
  responseSchema: Record<string, unknown>;
  /** Optional inline image (scan analysis, assistant photo questions). */
  imageBase64?: string;
  contentType?: string;
  /** Optional system instruction (assistant guardrails). */
  systemInstruction?: string;
};

/**
 * Low-level Gemini generateContent caller with timeout + bounded retries.
 */
export function createGeminiClient(config: GeminiClientConfig) {
  const timeoutMs = config.timeoutMs ?? 30_000;
  const maxRetries = config.maxRetries ?? 2;
  const temperature = config.temperature ?? 0.2;
  const fetchImpl = config.fetchImpl ?? fetch;
  const base =
    config.apiBaseUrl?.replace(/\/$/, '') ?? 'https://generativelanguage.googleapis.com/v1beta';

  return {
    async generate(request: GeminiGenerateRequest): Promise<GeminiGenerateResult> {
      return generateWithRetries(fetchImpl, {
        base,
        apiKey: config.apiKey,
        model: config.model,
        timeoutMs,
        temperature,
        maxRetries,
        request,
      });
    },
  };
}

type CallArgs = {
  base: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  temperature: number;
  maxRetries: number;
  request: GeminiGenerateRequest;
};

async function generateWithRetries(
  fetchImpl: typeof fetch,
  args: CallArgs,
): Promise<GeminiGenerateResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= args.maxRetries; attempt++) {
    try {
      return await callOnce(fetchImpl, args);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === args.maxRetries) {
        throw error;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('gemini_failed');
}

async function callOnce(fetchImpl: typeof fetch, args: CallArgs): Promise<GeminiGenerateResult> {
  const url = `${args.base}/models/${encodeURIComponent(args.model)}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': args.apiKey,
      },
      body: JSON.stringify(buildBody(args)),
    });
    return await readGenerateResult(response, args.model);
  } finally {
    clearTimeout(timer);
  }
}

async function readGenerateResult(
  response: Response,
  model: string,
): Promise<GeminiGenerateResult> {
  if (!response.ok) {
    throw httpError(response.status);
  }
  const payload = (await response.json()) as GeminiApiPayload;
  const text = firstCandidateText(payload);
  if (!text) {
    throw new Error('gemini_empty_response');
  }
  return {
    text,
    model,
    usage: {
      promptTokenCount: payload.usageMetadata?.promptTokenCount,
      candidatesTokenCount: payload.usageMetadata?.candidatesTokenCount,
      totalTokenCount: payload.usageMetadata?.totalTokenCount,
    },
  };
}

function httpError(status: number): Error {
  const err = new Error(`gemini_http_${String(status)}`);
  (err as Error & { status?: number }).status = status;
  return err;
}

function firstCandidateText(payload: GeminiApiPayload): string | undefined {
  return payload.candidates?.[0]?.content?.parts?.[0]?.text;
}

function buildBody(args: CallArgs): Record<string, unknown> {
  const { prompt, imageBase64, contentType, systemInstruction } = args.request;
  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: contentType ?? 'image/jpeg', data: imageBase64 } });
  }
  return {
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: args.temperature,
      responseMimeType: 'application/json',
      responseSchema: args.request.responseSchema,
    },
  };
}

type GeminiApiPayload = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  usageMetadata?: GeminiUsageMeta;
};

function isRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'AbortError') {
    return true;
  }
  const status = (error as Error & { status?: number }).status;
  return status === 429 || status === 500 || status === 502 || status === 503;
}
