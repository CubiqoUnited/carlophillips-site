import 'server-only';

import { STOREFRONT_API_VERSION } from './queries';
import type { GraphqlResponse, StorefrontApiVersion } from './types';

export type StorefrontFetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export interface StorefrontClientConfig {
  readonly storeDomain: string;
  readonly storefrontAccessToken: string;
  readonly apiVersion?: StorefrontApiVersion;
  readonly fetchImpl?: StorefrontFetch;
}

export interface StorefrontQueryOptions<TVariables> {
  readonly document: string;
  readonly variables: TVariables;
  readonly signal?: AbortSignal;
}

export type StorefrontMutationOptions<TVariables> =
  StorefrontQueryOptions<TVariables>;

export class StorefrontTransportError extends Error {
  readonly code: string;
  readonly status: number | null;

  constructor(code: string, message: string, status: number | null = null) {
    super(message);
    this.name = 'StorefrontTransportError';
    this.code = code;
    this.status = status;
  }
}

function normalizeStoreDomain(value: string): string {
  const candidate = value.trim().replace(/^https?:\/\//i, '');
  if (!candidate || candidate.includes('/') || candidate.includes('@')) {
    throw new StorefrontTransportError(
      'SHOPIFY_DOMAIN_INVALID',
      'Shopify Storefront domain is invalid.'
    );
  }

  let url: URL;
  try {
    url = new URL(`https://${candidate}`);
  } catch {
    throw new StorefrontTransportError(
      'SHOPIFY_DOMAIN_INVALID',
      'Shopify Storefront domain is invalid.'
    );
  }
  if (url.hostname !== candidate || url.port) {
    throw new StorefrontTransportError(
      'SHOPIFY_DOMAIN_INVALID',
      'Shopify Storefront domain is invalid.'
    );
  }
  return url.hostname.toLowerCase();
}

function assertOperationDocument(
  document: string,
  operation: 'query' | 'mutation'
): void {
  const withoutComments = document.replace(/#[^\n\r]*/g, '').trim();
  const forbidden = operation === 'query' ? /\bmutation\b/i : /\bquery\b/i;
  if (!withoutComments || forbidden.test(withoutComments)) {
    throw new StorefrontTransportError(
      'SHOPIFY_OPERATION_BOUNDARY',
      `This Storefront method accepts ${operation} documents only.`
    );
  }
  if (!new RegExp(`\\b${operation}\\b`, 'i').test(withoutComments)) {
    throw new StorefrontTransportError(
      'SHOPIFY_QUERY_DOCUMENT_INVALID',
      'A named Storefront GraphQL query is required.'
    );
  }
}

export function createStorefrontClient(config: StorefrontClientConfig) {
  const storeDomain = normalizeStoreDomain(config.storeDomain);
  const token = config.storefrontAccessToken.trim();
  if (!token) {
    throw new StorefrontTransportError(
      'SHOPIFY_TOKEN_MISSING',
      'Shopify Storefront access is not configured.'
    );
  }
  const apiVersion = config.apiVersion ?? STOREFRONT_API_VERSION;
  const fetchImpl = config.fetchImpl ?? fetch;
  const endpoint = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

  return Object.freeze({
    apiVersion,
    storeDomain,
    async query<TData, TVariables extends Readonly<Record<string, unknown>>>(
      options: StorefrontQueryOptions<TVariables>
    ): Promise<TData> {
      return execute('query', options);
    },
    async mutate<TData, TVariables extends Readonly<Record<string, unknown>>>(
      options: StorefrontMutationOptions<TVariables>
    ): Promise<TData> {
      return execute('mutation', options);
    },
  });

  async function execute<
    TData,
    TVariables extends Readonly<Record<string, unknown>>,
  >(
    operation: 'query' | 'mutation',
    options: StorefrontQueryOptions<TVariables>
  ): Promise<TData> {
    assertOperationDocument(options.document, operation);
    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: options.document,
        variables: options.variables,
      }),
      cache: 'no-store',
    };
    if (options.signal) requestInit.signal = options.signal;

    let response: Response;
    try {
      response = await fetchImpl(endpoint, requestInit);
    } catch {
      throw new StorefrontTransportError(
        'SHOPIFY_NETWORK_ERROR',
        'Shopify Storefront transport failed.'
      );
    }
    if (!response.ok) {
      throw new StorefrontTransportError(
        'SHOPIFY_HTTP_ERROR',
        `Shopify Storefront returned HTTP ${response.status}.`,
        response.status
      );
    }

    const executedVersion = response.headers?.get('x-shopify-api-version');
    if (executedVersion !== apiVersion) {
      throw new StorefrontTransportError(
        'SHOPIFY_API_VERSION_MISMATCH',
        'Shopify executed a different Storefront API version.'
      );
    }

    let payload: GraphqlResponse<TData>;
    try {
      payload = (await response.json()) as GraphqlResponse<TData>;
    } catch {
      throw new StorefrontTransportError(
        'SHOPIFY_RESPONSE_INVALID',
        'Shopify Storefront returned an invalid response.'
      );
    }
    if (payload.errors?.length) {
      throw new StorefrontTransportError(
        'SHOPIFY_GRAPHQL_ERROR',
        'Shopify Storefront rejected the query.'
      );
    }
    if (payload.data === undefined) {
      throw new StorefrontTransportError(
        'SHOPIFY_DATA_MISSING',
        'Shopify Storefront returned no query data.'
      );
    }
    return payload.data;
  }
}
