# Shopify package boundary

This strict TypeScript package owns read-only Storefront transport, pinned
queries, generated-style transport types, transport normalization, and verified
webhook observation inputs. Runtime entry points import `server-only`.

It deliberately owns no Product Release Record, Media Registry, visibility,
cart, checkout, order, publication, or production authority. The Storefront
client rejects GraphQL mutations. Webhook payloads must pass timing-safe HMAC,
topic/shop allowlists, timestamp/replay checks, and an injected atomic
idempotency claim before they can become `observation-only` inputs.

## Runtime migration still required

The root app continues to use `lib/providers/shopify` and `lib/shopify`. A
separate adapter migration must:

1. replace the root loader's fetch/query/types/normalization imports with
   `@repo/shopify`;
2. hash raw product and variant references inside the existing server Commerce
   Gateway before creating durable observations;
3. adapt the transport-only media shape into the existing Media Registry
   filter without treating it as approval;
4. preserve capability evidence, no-store reads, canonical observation
   fingerprints, and fail-closed error decisions;
5. add an authenticated app webhook route that injects durable idempotency
   storage and passes observation inputs to review without applying release
   patches; and
6. remove the legacy root Shopify files only after parity, release-authority,
   browser, and screenshot tests pass.
