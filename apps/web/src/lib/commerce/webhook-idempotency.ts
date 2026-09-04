import 'server-only';

import { createHash } from 'node:crypto';
import type { WebhookIdempotencyStore } from '@repo/shopify';
import type { CommerceEnvironment } from './runtime-types';

type DurableEnvironment = Exclude<CommerceEnvironment, 'local'>;
const DURABLE_REPLAY_TTL_MS = 60 * 60 * 24 * 30 * 1000;
const DURABLE_REPLAY_TTL_SECONDS = DURABLE_REPLAY_TTL_MS / 1000;

function deliveryKey(webhookId: string) {
  return createHash('sha256').update(webhookId).digest('hex');
}

export class DurableWebhookStore implements WebhookIdempotencyStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly namespace: DurableEnvironment,
    private readonly fetchImpl: typeof fetch = fetch
  ) {
    if (!url.startsWith('https://') || !token) {
      throw new Error('DURABLE_WEBHOOK_STORE_NOT_CONFIGURED');
    }
  }

  private async command(args: unknown[]) {
    const response = await this.fetchImpl(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('DURABLE_WEBHOOK_STORE_FAILED');
    return (await response.json()) as { result?: unknown; error?: string };
  }

  async claim(webhookId: string, expiresAt: Date) {
    const ttl = Math.max(
      DURABLE_REPLAY_TTL_MS,
      expiresAt.getTime() - Date.now()
    );
    const result = await this.command([
      'SET',
      `cp:${this.namespace}:shopify:webhook:${deliveryKey(webhookId)}`,
      'claimed',
      'NX',
      'PX',
      ttl,
    ]);
    return result.result === 'OK';
  }

  async record(webhookId: string, observation: object) {
    const result = await this.command([
      'SET',
      `cp:${this.namespace}:shopify:webhook-event:${deliveryKey(webhookId)}`,
      JSON.stringify(observation),
      'EX',
      DURABLE_REPLAY_TTL_SECONDS,
    ]);
    if (result.result !== 'OK') throw new Error('WEBHOOK_EVENT_STORE_FAILED');
  }

  async release(webhookId: string) {
    await this.command([
      'DEL',
      `cp:${this.namespace}:shopify:webhook:${deliveryKey(webhookId)}`,
    ]);
  }
}

export function createDurableWebhookStore(
  environment: DurableEnvironment,
  fetchImpl: typeof fetch = fetch
) {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  return new DurableWebhookStore(url, token, environment, fetchImpl);
}
