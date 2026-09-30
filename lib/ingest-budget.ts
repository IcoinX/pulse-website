// Bound both response headers AND body; fetch resolving alone is not completion.
export async function fetchWithinBudget(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  deadline: number,
  requestTimeout = 5000,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const remaining = Math.min(requestTimeout, deadline - Date.now());
  if (remaining <= 0) throw new Error('Ingestion time budget exhausted');
  const controller = new AbortController();
  const signal = init?.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;
  const timeout = setTimeout(() => controller.abort(), remaining);
  try {
    const response = await fetcher(input, { ...init, signal });
    const body = await response.arrayBuffer();
    return new Response(body.byteLength ? body : null, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
  } finally {
    clearTimeout(timeout);
  }
}
