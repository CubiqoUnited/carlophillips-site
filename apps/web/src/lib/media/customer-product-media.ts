export const CUSTOMER_MEDIA_ORDER = [1, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export function curateCustomerMedia<T>(items: readonly T[], limit = 12): T[] {
  const editorial = CUSTOMER_MEDIA_ORDER.map((index) => items[index]).filter(
    (item): item is T => Boolean(item)
  );
  return (editorial.length > 0 ? editorial : items).slice(0, limit);
}
