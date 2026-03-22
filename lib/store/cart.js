// Simple cart state management using localStorage
// In production, this would connect to Shopify's cart API

export const CART_STORAGE_KEY = 'carlophillips_cart';

export function getCart() {
  if (typeof window === 'undefined') return { items: [], total: 0 };
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading cart:', e);
  }
  
  return { items: [], total: 0 };
}

export function saveCart(cart) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

export function addToCart(product, selectedColor, selectedSize, quantity = 1) {
  const cart = getCart();
  
  const itemKey = `${product.id}-${selectedColor}-${selectedSize}`;
  const existingIndex = cart.items.findIndex(item => item.key === itemKey);
  
  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      key: itemKey,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  }
  
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

export function removeFromCart(itemKey) {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.key !== itemKey);
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

export function updateQuantity(itemKey, quantity) {
  const cart = getCart();
  const item = cart.items.find(item => item.key === itemKey);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(itemKey);
    }
    item.quantity = quantity;
  }
  
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  const cart = { items: [], total: 0 };
  saveCart(cart);
  return cart;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function getCartItemCount() {
  const cart = getCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}
