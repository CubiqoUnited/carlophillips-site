export type StorefrontMenuCategory = {
  key: string;
  label: string;
  menuLabel: string;
  href: string;
};

export const STOREFRONT_MENU_HOME = {
  label: 'Home',
  menuLabel: 'HOME',
  href: '/',
} as const;

export const STOREFRONT_MENU_ALL_CATEGORIES = {
  label: 'All categories',
  menuLabel: 'ALL CATEGORIES',
  href: '/shop',
} as const;

export const DEFAULT_STOREFRONT_MENU_CATEGORIES: StorefrontMenuCategory[] = [
  {
    key: 'tshirts',
    label: 'T-shirts',
    menuLabel: 'ALL TSHIRTS',
    href: '/shop?category=tshirts',
  },
  {
    key: 'hoodies',
    label: 'Hoodies',
    menuLabel: 'ALL HOODIES',
    href: '/shop?category=hoodies',
  },
];

export const STOREFRONT_MENU_SUPPORT_LINKS = [
  {
    label: 'Aftercare',
    menuLabel: 'AFTERCARE',
    href: '/aftercare',
  },
  {
    label: 'Contact',
    menuLabel: 'CONTACT',
    href: '/contact',
  },
  {
    label: 'Account',
    menuLabel: 'ACCOUNT',
    href: '/member',
  },
  {
    label: 'Private list',
    menuLabel: 'PRIVATE LIST',
    href: '/private-list',
  },
] as const;

export function resolveStorefrontMenuCategories(
  categories?: Array<{ label: string; href: string; key?: string }>
): StorefrontMenuCategory[] {
  if (!categories?.length) return DEFAULT_STOREFRONT_MENU_CATEGORIES;

  const resolved = new Map(
    DEFAULT_STOREFRONT_MENU_CATEGORIES.map((category) => [
      category.key,
      category,
    ])
  );

  for (const category of categories) {
    const key =
      category.key ||
      new URL(category.href, 'https://carlophillips.com').searchParams.get(
        'category'
      ) ||
      category.href;
    const fallback = DEFAULT_STOREFRONT_MENU_CATEGORIES.find(
      (entry) => entry.key === key
    );
    resolved.set(key, {
      key,
      label: fallback?.label || formatCategoryLabel(category.label),
      menuLabel:
        fallback?.menuLabel ||
        `ALL ${formatCategoryLabel(category.label).toUpperCase()}`,
      href: category.href,
    });
  }

  return DEFAULT_STOREFRONT_MENU_CATEGORIES.map(
    (category) => resolved.get(category.key) || category
  );
}

function formatCategoryLabel(label: string): string {
  const normalized = label.trim().toLowerCase();
  if (normalized === 'tshirts' || normalized === 't-shirts') return 'T-shirts';
  if (normalized === 'hoodies') return 'Hoodies';
  return label
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
}
