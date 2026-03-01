type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export type DirectusErrorResponse = {
  errors?: Array<{
    message?: string;
    extensions?: {
      code?: string;
    };
  }>;
};

export class DirectusRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "DirectusRequestError";
  }
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export class DirectusClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getAccessToken?: () => string | null,
  ) {}

  async request<TResponse>(
    path: string,
    options: {
      method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
      query?: Record<string, string>;
      body?: JsonObject;
      accessToken?: string;
    } = {},
  ): Promise<TResponse> {
    const url = new URL(joinUrl(this.baseUrl, path));
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        url.searchParams.set(key, value);
      }
    }

    const accessToken = options.accessToken ?? this.getAccessToken?.() ?? null;

    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    const data = text.length > 0 ? (JSON.parse(text) as unknown) : undefined;

    if (!res.ok) {
      const maybeDirectus = (data ?? {}) as DirectusErrorResponse;
      const message =
        maybeDirectus.errors?.[0]?.message ??
        `Directus request failed (${res.status})`;
      throw new DirectusRequestError(res.status, message);
    }

    return data as TResponse;
  }

  async login(email: string, password: string) {
    const res = await this.request<{
      data: {
        access_token: string;
        refresh_token: string;
        expires: number;
      };
    }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    return res.data;
  }
}
