/*
 * Screen 27 — Order tracking stages.
 *
 * Only the stage a confirmed order actually evidences is recorded. Production, shipment and
 * delivery stay "Pending update" until a fulfilment event says otherwise, which is what the mock
 * shows and what the appendix "Tracking pending" state exists to explain.
 */
export const ORDER_TRACKING_STAGES = Object.freeze([
  Object.freeze({ id: 'confirmed', label: 'Order confirmed', recorded: true }),
  Object.freeze({ id: 'production', label: 'In production', recorded: false }),
  Object.freeze({ id: 'shipped', label: 'Shipped', recorded: false }),
  Object.freeze({ id: 'delivered', label: 'Delivered', recorded: false }),
]);

export function applyFulfilmentEvents(events = [], stages = ORDER_TRACKING_STAGES) {
  const recorded = new Set(events.map(event => event?.stageId).filter(Boolean));
  return stages.map(stage => ({ ...stage, recorded: stage.recorded || recorded.has(stage.id) }));
}
