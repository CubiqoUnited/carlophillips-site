'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ShoppingBag, ChevronLeft, ChevronRight, Plus, Minus, ArrowRight, Play, Pause, Volume2, VolumeX, Loader2, Instagram, Mail } from 'lucide-react';

// Data imports
import { 
  collections as mockCollections, 
  products as mockProducts, 
  getProduct, 
  getProductsByCollection, 
  getCollection, 
  getFeaturedProducts, 
  getFeaturedCollections,
  getProductAsync,
  getProductsByCollectionAsync,
  getCollectionAsync,
  getProducts,
  isUsingShopify
} from '@/lib/data/products';

import { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  getCartItemCount, 
  getCheckoutUrl, 
  isCheckoutAvailable,
  redirectToCheckout,
  initializeCart,
  isUsingShopifyCart 
} from '@/lib/store/cart';

// Content & Assets imports
import { 
  site, 
  homepage, 
  collections as collectionsContent, 
  about as aboutContent, 
  lookbook as lookbookContent, 
  product as productContent, 
  cart as cartContent, 
  footer as footerContent, 
  navigation as navigationContent 
} from '@/lib/content';

import { 
  getHeroVideoUrl, 
  getHeroPosterUrl, 
  getLogoUrl, 
  hasLogoImage, 
  getCampaignImages, 
  getCollectionBanner,
  getPlaceholder 
} from '@/lib/assets';

// Brand imports
import { 
  brands, 
  brandOrder, 
  defaultBrand, 
  detectBrandFromDomain, 
  getBrand, 
  getAllBrands 
} from '@/lib/brands';

// ============ BRAND SWITCHER COMPONENT ============
function BrandSwitcher({ currentBrand, onBrandChange }) {
  const allBrands = getAllBrands();
  
  return (
    <div className="flex items-center gap-1">
      {allBrands.map((brand) => {
        const isActive = currentBrand === brand.id;
        return (
          <button
            key={brand.id}
            onClick={() => onBrandChange(brand.id)}
            className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-all duration-300 ${
              isActive 
                ? 'bg-white text-black' 
                : 'text-white/60 hover:text-white'
            }`}
            aria-pressed={isActive}
          >
            {brand.id === 'carlophillips' ? 'CP' : brand.id === 'lovecarlo' ? 'LOVE' : 'HOME'}
          </button>
        );
      })}
    </div>
  );
}

// ============ OPTIMIZED IMAGE COMPONENT ============
function OptimizedImage({ src, alt, className = '', loading = 'lazy', sizes = '100vw', priority = false, onLoad, onError }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const placeholder = getPlaceholder('product');

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      src={hasError ? placeholder : src}
      alt={alt}
      className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={priority ? 'eager' : loading}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

// ============ PREMIUM LOADING COMPONENT ============
function LoadingSpinner({ size = 'default', text = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-label="Loading">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={sizeClasses[size]}
      >
        <Loader2 className="w-full h-full text-white/50" strokeWidth={1.5} />
      </motion.div>
      {text && (
        <p className="text-white/40 text-xs tracking-[0.2em] uppercase">{text}</p>
      )}
    </div>
  );
}

// ============ PREMIUM LOADING SKELETON ============
function ProductSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[3/4] bg-white/5 mb-4" />
      <div className="h-4 bg-white/5 w-3/4 mb-2" />
      <div className="h-3 bg-white/5 w-1/2 mb-2" />
      <div className="h-4 bg-white/5 w-1/4" />
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-black" role="status" aria-label="Loading product">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative h-screen lg:sticky lg:top-0 bg-white/5 animate-pulse" />
        <div className="p-6 lg:p-16 flex flex-col justify-center">
          <div className="animate-pulse space-y-6">
            <div className="h-3 bg-white/5 w-24" />
            <div className="h-12 bg-white/5 w-3/4" />
            <div className="h-8 bg-white/5 w-20" />
            <div className="space-y-2">
              <div className="h-4 bg-white/5 w-full" />
              <div className="h-4 bg-white/5 w-5/6" />
              <div className="h-4 bg-white/5 w-4/6" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-12 bg-white/5 w-20" />
              <div className="h-12 bg-white/5 w-20" />
              <div className="h-12 bg-white/5 w-20" />
            </div>
            <div className="h-14 bg-white/10 w-full mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PREMIUM ERROR STATE ============
function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
      role="alert"
    >
      <div className="w-16 h-16 border border-white/20 flex items-center justify-center mb-6">
        <X className="w-6 h-6 text-white/40" strokeWidth={1} aria-hidden="true" />
      </div>
      <p className="text-white/60 text-sm mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-3 text-xs tracking-[0.2em] uppercase border border-white/30 text-white/70 hover:bg-white hover:text-black transition-all"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}

// ============ EMPTY STATE ============
function EmptyState({ title = 'No products found', description = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-16 h-16 border border-white/20 flex items-center justify-center mb-6">
        <ShoppingBag className="w-6 h-6 text-white/40" strokeWidth={1} aria-hidden="true" />
      </div>
      <h3 className="text-white text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 text-sm max-w-md">{description}</p>
      )}
    </motion.div>
  );
}

// ============ LOGO COMPONENT ============
function Logo({ className = '', onClick }) {
  const logoUrl = getLogoUrl('light');
  
  if (logoUrl) {
    return (
      <button onClick={onClick} className={className} aria-label={`${site.name} - Go to homepage`}>
        <img 
          src={logoUrl} 
          alt={site.name} 
          className="h-6 md:h-8 w-auto"
        />
      </button>
    );
  }
  
  return (
    <button onClick={onClick} className={className} aria-label={`${site.name} - Go to homepage`}>
      <span className="text-white text-sm md:text-base tracking-[0.4em] font-light uppercase">
        {site.name}
      </span>
    </button>
  );
}

// ============ NAVIGATION COMPONENT - VOLLEBAK STYLE ============
function Navigation({ onCartClick, cartCount, onNavigate, isTransparent = true, currentBrand, onBrandChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const brand = getBrand(currentBrand);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgClass = isTransparent && !isScrolled 
    ? 'bg-transparent' 
    : 'bg-black/90 backdrop-blur-md';

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${bgClass}`}
        role="banner"
      >
        {/* Brand Switcher Bar */}
        <div className="hidden md:flex justify-center items-center py-2 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-6">
            {getAllBrands().map((b) => (
              <button
                key={b.id}
                onClick={() => onBrandChange(b.id)}
                className={`text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
                  currentBrand === b.id 
                    ? 'text-white' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex items-center justify-between px-6 lg:px-10 h-16 lg:h-20" aria-label="Main navigation">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white hover:opacity-60 transition-opacity flex items-center gap-3"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">{navigationContent.actions.menu}</span>
          </button>

          {/* Logo - Shows current brand */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex flex-col items-center"
              aria-label={`${brand.name} - Go to homepage`}
            >
              <span className="text-white text-sm md:text-base tracking-[0.4em] font-light uppercase">
                {brand.name}
              </span>
              {brand.id !== 'carlophillips' && (
                <span className="text-white/40 text-[9px] tracking-[0.15em] uppercase">
                  by CARLOPHILLIPS
                </span>
              )}
            </button>
          </div>

          {/* Mobile Brand Switcher + Cart */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <BrandSwitcher currentBrand={currentBrand} onBrandChange={onBrandChange} />
            </div>
            <button
              onClick={onCartClick}
              className="text-white hover:opacity-60 transition-opacity flex items-center gap-3"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">
                {navigationContent.actions.bag} {cartCount > 0 && `(${cartCount})`}
              </span>
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full Screen Menu - Vollebak Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="main-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="h-full flex flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-6 lg:px-10 h-16 lg:h-20">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:opacity-60 transition-opacity flex items-center gap-3"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                  <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">{navigationContent.actions.close}</span>
                </button>
                <span className="text-white text-sm md:text-base tracking-[0.4em] font-light uppercase">
                  {site.name}
                </span>
                <div className="w-20" />
              </div>

              {/* Menu Content */}
              <nav className="flex-1 flex items-center justify-center" aria-label="Site navigation">
                <ul className="text-center space-y-2">
                  {navigationContent.menu.map((item, index) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    >
                      <button
                        onClick={() => {
                          if (item.collection) {
                            onNavigate('collections', item.id === 'home-collection' ? 'home' : item.id);
                          } else {
                            onNavigate(item.id);
                          }
                          setIsMenuOpen(false);
                        }}
                        className="block text-white text-4xl md:text-6xl lg:text-7xl font-light tracking-wide hover:opacity-50 transition-opacity py-1"
                        style={{ fontFamily: 'system-ui' }}
                      >
                        {item.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Menu Footer */}
              <div className="px-6 lg:px-10 py-8 border-t border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-white/50 text-xs tracking-[0.15em] uppercase">
                  <div className="flex gap-8">
                    <a 
                      href={site.social.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-white transition-colors"
                      aria-label="Follow us on Instagram"
                    >
                      Instagram
                    </a>
                    <a 
                      href={site.social.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-white transition-colors"
                      aria-label="Follow us on TikTok"
                    >
                      TikTok
                    </a>
                  </div>
                  {site.banner && <span>{site.banner.text}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============ CART SIDEBAR - PREMIUM STYLE WITH SHOPIFY INTEGRATION ============
function CartSidebar({ isOpen, onClose, cart = { items: [], total: 0 }, onUpdateQuantity, onRemoveItem, onRefresh }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const items = cart?.items || [];
  const total = cart?.total || 0;
  const checkoutUrl = cart?.checkoutUrl || getCheckoutUrl();
  const isShopifyCart = isUsingShopifyCart();
  
  const handleQuantityChange = async (itemKey, newQuantity) => {
    setUpdatingItem(itemKey);
    setIsUpdating(true);
    try {
      await onUpdateQuantity(itemKey, newQuantity);
    } finally {
      setIsUpdating(false);
      setUpdatingItem(null);
    }
  };
  
  const handleRemove = async (itemKey) => {
    setUpdatingItem(itemKey);
    setIsUpdating(true);
    try {
      await onRemoveItem(itemKey);
    } finally {
      setIsUpdating(false);
      setUpdatingItem(null);
    }
  };
  
  const handleCheckout = () => {
    if (checkoutUrl) {
      setIsCheckingOut(true);
      window.location.href = checkoutUrl;
    } else if (isShopifyCart) {
      alert('Unable to proceed to checkout. Please try again.');
    } else {
      alert('Checkout will be available when Shopify is connected. Add your Shopify credentials to enable checkout.');
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-black text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm tracking-[0.3em] uppercase">{cartContent.title} ({items.length})</h2>
                  {isUpdating && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      aria-hidden="true"
                    >
                      <Loader2 className="w-4 h-4 text-white/50" />
                    </motion.div>
                  )}
                </div>
                <button 
                  onClick={onClose} 
                  className="hover:opacity-60 transition-opacity"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 mb-6 text-white/30" strokeWidth={1} aria-hidden="true" />
                    <p className="text-white/50 text-sm tracking-wider mb-2">{cartContent.emptyMessage}</p>
                    <button 
                      onClick={onClose}
                      className="text-white/70 text-xs tracking-wider uppercase hover:text-white transition-colors"
                    >
                      {cartContent.continueShopping}
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-8">
                    {items.map((item) => {
                      const isItemUpdating = updatingItem === item.key;
                      return (
                        <motion.li 
                          key={item.key} 
                          className={`flex gap-6 transition-opacity ${isItemUpdating ? 'opacity-50' : 'opacity-100'}`}
                          layout
                        >
                          <div className="w-28 h-36 bg-neutral-900 overflow-hidden flex-shrink-0">
                            <OptimizedImage 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm tracking-wide mb-1 truncate">{item.name}</h3>
                            <p className="text-xs text-white/50 mb-3">{item.color} / {item.size}</p>
                            <p className="text-sm mb-4">{site.currency.symbol}{item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" aria-hidden="true" />
                              </button>
                              <span className="text-sm w-6 text-center" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" aria-hidden="true" />
                              </button>
                              <button
                                onClick={() => handleRemove(item.key)}
                                disabled={isUpdating}
                                className="ml-auto text-xs text-white/50 hover:text-white transition-colors tracking-wider uppercase disabled:opacity-50"
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                {isItemUpdating ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer with Checkout */}
              {items.length > 0 && (
                <div className="border-t border-white/10 p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">{cartContent.subtotal}</span>
                    <span className="font-medium">{site.currency.symbol}{total.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-xs text-white/40">{cartContent.shippingNote}</p>
                  
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut || items.length === 0}
                    className="w-full py-4 bg-white text-black text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          aria-hidden="true"
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      cartContent.checkoutButton
                    )}
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className="w-full py-3 text-white/70 text-xs tracking-[0.15em] uppercase hover:text-white transition-colors"
                  >
                    {cartContent.continueShopping}
                  </button>
                  
                  {isShopifyCart && checkoutUrl && (
                    <p className="text-green-500/60 text-[10px] text-center tracking-wider mt-2">
                      {cartContent.status.shopifyConnected}
                    </p>
                  )}
                  {!isShopifyCart && (
                    <p className="text-yellow-500/60 text-[10px] text-center tracking-wider mt-2">
                      {cartContent.status.demoMode}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ============ FULL-BLEED HERO SECTION - VOLLEBAK STYLE ============
function HeroSection({ onShopClick }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const videoUrl = getHeroVideoUrl();
  const posterUrl = getHeroPosterUrl();
  const heroContent = homepage.hero;

  // Parse headline for line breaks
  const headlineParts = heroContent.headline.split('\n');

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black" aria-label="Hero section">
      {/* Video/Image Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          poster={posterUrl}
          className="w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" aria-hidden="true" />

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 flex flex-col justify-end p-6 lg:p-16 pb-24 lg:pb-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4 lg:mb-6">
            {heroContent.eyebrow}
          </p>
          <h1 className="text-white text-5xl md:text-7xl lg:text-[8rem] font-light leading-[0.9] mb-6 lg:mb-8 tracking-tight">
            {headlineParts.map((part, i) => (
              <span key={i}>
                {part}
                {i < headlineParts.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-lg mb-8 lg:mb-10 leading-relaxed">
            {heroContent.description}
          </p>
          <button
            onClick={onShopClick}
            className="group inline-flex items-center gap-4 text-white text-xs tracking-[0.25em] uppercase border-b border-white/30 pb-2 hover:border-white transition-colors"
          >
            {heroContent.cta.text}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
          </button>
        </motion.div>

        {/* Video Controls */}
        <div className="absolute bottom-8 right-6 lg:right-16 flex gap-3">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause();
                } else {
                  videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}
            className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============ FULL-BLEED PRODUCT HERO - VOLLEBAK STYLE ============
function ProductHero({ product, onBuyClick, reverse = false }) {
  if (!product) return null;
  
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <OptimizedImage
          src={product.heroImage || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      <div className={`absolute inset-0 ${reverse ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/80 via-black/40 to-transparent`} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" aria-hidden="true" />

      <div className={`absolute inset-0 flex items-end lg:items-center p-6 lg:p-16 pb-24 lg:pb-16 ${reverse ? 'lg:justify-end' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`max-w-xl ${reverse ? 'lg:text-right' : ''}`}
        >
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4 tracking-tight">
            {product.name}
          </h2>
          <p className="text-white/60 text-sm md:text-base uppercase tracking-[0.2em] mb-6">
            {product.tagline || product.description?.slice(0, 80)}
          </p>
          <button
            onClick={() => onBuyClick(product.id)}
            className="inline-flex items-center gap-3 text-white text-xs tracking-[0.25em] uppercase border border-white/30 px-8 py-4 hover:bg-white hover:text-black transition-all"
          >
            Buy Now
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ HORIZONTAL PRODUCT CAROUSEL - VOLLEBAK STYLE ============
function ProductCarousel({ title, products: carouselProducts, onProductClick, isLoading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  const scrollTo = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 400;
      const newScroll = direction === 'left' 
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount;
      containerRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-black" aria-label={title}>
        <div className="px-6 lg:px-16 mb-8 lg:mb-12">
          <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-tight">
            {title}
          </h2>
        </div>
        <div className="px-6 lg:px-16">
          <div className="flex gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 lg:w-80">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!carouselProducts || carouselProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-black" aria-label={title}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-16 mb-8 lg:mb-12">
        <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm tracking-wider" aria-live="polite">
            {String(currentIndex + 1).padStart(2, '0')} / {String(carouselProducts.length).padStart(2, '0')}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => scrollTo('left')}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button 
              onClick={() => scrollTo('right')}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div 
        ref={containerRef}
        className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide px-6 lg:px-16 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const index = Math.round(e.target.scrollLeft / 400);
          setCurrentIndex(Math.min(index, carouselProducts.length - 1));
        }}
        role="list"
        aria-label={`${title} products`}
      >
        {carouselProducts.map((product, index) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onProductClick(product.id)}
            className="flex-shrink-0 w-72 lg:w-80 cursor-pointer group"
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onProductClick(product.id)}
          >
            <div className="aspect-[3/4] overflow-hidden bg-neutral-900 mb-4 relative">
              <OptimizedImage
                src={product.images?.[0] || product.heroImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" aria-hidden="true" />
            </div>
            <h3 className="text-white text-sm tracking-wide mb-1">{product.name}</h3>
            <p className="text-white/40 text-xs mb-2 line-clamp-2">{product.tagline || product.description?.slice(0, 60)}...</p>
            <p className="text-white text-sm">{site.currency.symbol}{product.price}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ============ BRAND STATEMENT SECTION ============
function BrandStatement({ onLearnMore }) {
  const statement = homepage.brandStatement;
  
  return (
    <section className="py-24 lg:py-40 bg-black" aria-labelledby="brand-statement-heading">
      <div className="max-w-5xl mx-auto px-6 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-8">{statement.eyebrow}</p>
          <h2 id="brand-statement-heading" className="text-white text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8 tracking-tight">
            {statement.headline}
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            {statement.description}
          </p>
          <button 
            onClick={onLearnMore}
            className="inline-flex items-center gap-3 text-white text-xs tracking-[0.25em] uppercase border-b border-white/30 pb-2 hover:border-white transition-colors"
          >
            {statement.cta.text}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ PRESS LOGOS SECTION - VOLLEBAK STYLE ============
function PressSection() {
  const pressItems = homepage.press;

  return (
    <section className="py-16 bg-black border-y border-white/10" aria-label="Press mentions">
      <div className="overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 lg:gap-24 whitespace-nowrap"
          aria-hidden="true"
        >
          {[...pressItems, ...pressItems, ...pressItems].map((item, index) => (
            <div key={index} className="flex items-center gap-4 lg:gap-6">
              <span className="text-white/30 text-2xl lg:text-3xl font-light tracking-[0.2em]">{item.name}</span>
              <span className="text-white/50 text-sm italic">{item.quote}</span>
            </div>
          ))}
        </motion.div>
      </div>
      {/* Screen reader text */}
      <div className="sr-only">
        <h2>Press mentions</h2>
        <ul>
          {pressItems.map((item, index) => (
            <li key={index}>{item.name}: {item.quote}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ============ COLLECTION SHOWCASE - VOLLEBAK STYLE ============
function CollectionShowcase({ collection, onExplore }) {
  if (!collection) return null;
  
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black" aria-labelledby={`collection-${collection.id}-heading`}>
      <div className="absolute inset-0">
        <OptimizedImage
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover opacity-80"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" aria-hidden="true" />
      
      <div className="absolute inset-0 flex items-end p-6 lg:p-16 pb-16 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 id={`collection-${collection.id}-heading`} className="text-white text-4xl md:text-5xl lg:text-6xl font-light mb-4">
            {collection.name}
          </h3>
          <p className="text-white/60 text-sm md:text-base uppercase tracking-[0.15em] mb-6 max-w-md">
            {collection.description}
          </p>
          <button
            onClick={() => onExplore(collection.id)}
            className="inline-flex items-center gap-3 text-white text-xs tracking-[0.25em] uppercase border border-white/30 px-8 py-4 hover:bg-white hover:text-black transition-all"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER - PREMIUM STYLE ============
function Footer({ onNavigate }) {
  return (
    <footer className="bg-black text-white py-16 lg:py-24 border-t border-white/10" role="contentinfo">
      <div className="px-6 lg:px-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="text-2xl tracking-[0.3em] font-light mb-6">{site.name}</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mb-6">
              {footerContent.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
              </a>
              <a 
                href={`mailto:hello@carlophillips.com`}
                className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
                aria-label="Contact us via email"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <nav aria-label="Shop navigation">
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-white/70">{footerContent.navigation.shop.title}</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {footerContent.navigation.shop.links.map((link, i) => (
                <li key={i}>
                  <button 
                    onClick={() => {
                      if (link.href === '/collections') {
                        onNavigate('collections');
                      } else if (link.href.startsWith('/collections/')) {
                        const collectionId = link.href.replace('/collections/', '');
                        onNavigate('collections', collectionId);
                      }
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company navigation">
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-white/70">{footerContent.navigation.company.title}</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {footerContent.navigation.company.links.map((link, i) => (
                <li key={i}>
                  <button 
                    onClick={() => {
                      if (link.href === '/about') {
                        onNavigate('about');
                      }
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">{footerContent.copyright}</p>
          <nav className="flex gap-6 text-xs text-white/30" aria-label="Legal navigation">
            {footerContent.legal.map((link, i) => (
              <button key={i} className="hover:text-white transition-colors">
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

// ============ COLLECTIONS PAGE - WITH SHOPIFY DATA LOADING ============
function CollectionsPage({ onProductClick, selectedCollection, onCollectionChange }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collection, setCollection] = useState(null);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [allCollections, setAllCollections] = useState(mockCollections);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedCollection) {
          const collectionData = await getCollectionAsync(selectedCollection);
          setCollection(collectionData);
          const products = await getProductsByCollectionAsync(selectedCollection);
          setDisplayProducts(products);
        } else {
          setCollection(null);
          const products = await getProducts();
          setDisplayProducts(products);
        }
      } catch (err) {
        console.error('Error loading collection data:', err);
        setError('Failed to load products. Please try again.');
        
        if (selectedCollection) {
          setCollection(getCollection(selectedCollection));
          setDisplayProducts(getProductsByCollection(selectedCollection));
        } else {
          setDisplayProducts(mockProducts);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedCollection]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const pageTitle = collection ? collection.name : collectionsContent.allProducts.title;
  const pageDescription = collection ? collection.description : collectionsContent.allProducts.description;

  return (
    <div className="min-h-screen bg-black pt-24 lg:pt-32">
      {/* Header */}
      <div className="px-6 lg:px-16 mb-12 lg:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-light">
              {pageTitle}
            </h1>
            {isLoading && <LoadingSpinner size="small" />}
          </div>
          <p className="text-white/50 text-sm md:text-base max-w-xl">
            {pageDescription}
          </p>
          {isUsingShopify() && (
            <p className="text-green-500/60 text-xs mt-2 tracking-wider">● Connected to Shopify</p>
          )}
        </motion.div>

        {/* Collection Filter */}
        {!selectedCollection && (
          <nav className="flex flex-wrap gap-3 mt-8" aria-label="Filter by collection">
            {allCollections.map((col) => (
              <button
                key={col.id}
                onClick={() => onCollectionChange(col.id)}
                className="px-5 py-2 text-xs tracking-[0.15em] uppercase border border-white/20 text-white/70 hover:bg-white hover:text-black transition-all"
              >
                {col.name}
              </button>
            ))}
          </nav>
        )}

        {/* Back to all button */}
        {selectedCollection && (
          <button
            onClick={() => onCollectionChange(null)}
            className="mt-6 text-white/50 text-xs tracking-wider uppercase hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
            View All Products
          </button>
        )}
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="px-6 lg:px-16">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="px-6 lg:px-16 pb-24">
          <ProductGridSkeleton count={8} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayProducts.length === 0 && (
        <div className="px-6 lg:px-16 pb-24">
          <EmptyState 
            title="No products found" 
            description={selectedCollection ? "This collection is empty." : "Check back soon for new arrivals."}
          />
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !error && displayProducts.length > 0 && (
        <div 
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 px-6 lg:px-16 pb-24"
          role="list"
          aria-label="Products"
        >
          {displayProducts.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => onProductClick(product.id)}
              className="cursor-pointer group"
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onProductClick(product.id)}
            >
              <div className="aspect-[3/4] overflow-hidden bg-neutral-900 mb-4 relative">
                <OptimizedImage
                  src={product.images?.[0] || product.heroImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs tracking-wider uppercase">Quick View</span>
                </div>
              </div>
              <h2 className="text-white text-sm tracking-wide mb-1">{product.name}</h2>
              <p className="text-white/40 text-xs mb-2 line-clamp-1">{product.tagline || ''}</p>
              <p className="text-white text-sm">{site.currency.symbol}{product.price}</p>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PRODUCT PAGE - WITH SHOPIFY DATA LOADING ============
function ProductPage({ productId, onAddToCart, onBack }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const productData = await getProductAsync(productId);
        
        if (productData) {
          setProduct(productData);
          setSelectedColor(productData.variants?.colors?.[0] || 'Default');
          setSelectedSize(productData.variants?.sizes?.[0] || 'One Size');
          setCurrentImage(0);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again.');
        
        const mockProduct = getProduct(productId);
        if (mockProduct) {
          setProduct(mockProduct);
          setSelectedColor(mockProduct.variants?.colors?.[0] || 'Default');
          setSelectedSize(mockProduct.variants?.sizes?.[0] || 'One Size');
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAdding(true);
    try {
      await onAddToCart(product, selectedColor, selectedSize);
    } finally {
      setTimeout(() => setIsAdding(false), 1500);
    }
  };

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <ErrorState message={error} onRetry={onBack} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <EmptyState title="Product not found" description="This product may have been removed or doesn't exist." />
      </div>
    );
  }

  const collectionName = getCollection(product.collection)?.name || product.collection;

  return (
    <div className="min-h-screen bg-black">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Image Section */}
        <div className="relative h-screen lg:sticky lg:top-0">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={product.images?.[currentImage] || product.heroImage}
              alt={`${product.name} - Image ${currentImage + 1}`}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
          
          {/* Image Navigation */}
          {product.images && product.images.length > 1 && (
            <nav className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" aria-label="Product images">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImage === index ? 'bg-white w-6' : 'bg-white/40'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={currentImage === index ? 'true' : undefined}
                />
              ))}
            </nav>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 lg:p-16 flex flex-col justify-center">
          <button
            onClick={onBack}
            className="text-white/50 text-xs tracking-wider uppercase mb-8 hover:text-white transition-colors self-start flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">
              {collectionName}
            </p>
            <h1 className="text-white text-4xl md:text-5xl font-light mb-4">{product.name}</h1>
            <p className="text-white text-2xl mb-8">{site.currency.symbol}{product.price}</p>
            
            {product.tagline && (
              <p className="text-white/80 text-xs tracking-wider uppercase mb-6 border-l-2 border-white/30 pl-4">
                {product.tagline}
              </p>
            )}
            
            <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-lg">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.variants?.colors && product.variants.colors.length > 0 && product.variants.colors[0] !== 'Default' && (
              <fieldset className="mb-8">
                <legend className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">
                  {productContent.labels.color} — {selectedColor}
                </legend>
                <div className="flex flex-wrap gap-3">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-3 text-xs tracking-wider border transition-all ${
                        selectedColor === color
                          ? 'border-white bg-white text-black'
                          : 'border-white/20 text-white/70 hover:border-white'
                      }`}
                      aria-pressed={selectedColor === color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Size Selection */}
            {product.variants?.sizes && product.variants.sizes.length > 0 && product.variants.sizes[0] !== 'One Size' && (
              <fieldset className="mb-10">
                <legend className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">
                  {productContent.labels.size} — {selectedSize}
                </legend>
                <div className="flex flex-wrap gap-3">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 text-xs tracking-wider border transition-all ${
                        selectedSize === size
                          ? 'border-white bg-white text-black'
                          : 'border-white/20 text-white/70 hover:border-white'
                      }`}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full py-5 bg-white text-black text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isAdding ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    aria-hidden="true"
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                  {productContent.labels.addedToBag}
                </>
              ) : (
                productContent.labels.addToBag
              )}
            </button>

            {/* Shopify indicator */}
            {isUsingShopify() && productContent.shopifyIndicator.connected && (
              <p className="text-green-500/60 text-xs mt-4 text-center tracking-wider">{productContent.shopifyIndicator.connected}</p>
            )}

            {/* Product Details */}
            {product.details && product.details.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h2 className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">{productContent.labels.details}</h2>
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="text-white/60 text-sm">• {detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============ ABOUT PAGE - PREMIUM STYLE ============
function AboutPage() {
  const about = aboutContent;
  
  return (
    <article className="min-h-screen bg-black pt-24">
      {/* Hero */}
      <section className="h-[60vh] relative">
        <OptimizedImage
          src={about.hero.image}
          alt={about.hero.title}
          className="w-full h-full object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex items-end p-6 lg:p-16 pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-5xl md:text-7xl lg:text-8xl font-light"
          >
            {about.hero.title}
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 lg:py-32 px-6 lg:px-16" aria-labelledby="story-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 id="story-heading" className="sr-only">Our Story</h2>
            <p className="text-white text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-12">
              {about.story.headline}
            </p>
            {about.story.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-white/50 text-base leading-relaxed mb-8">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 border-t border-white/10" aria-labelledby="values-heading">
        <div className="px-6 lg:px-16">
          <h2 id="values-heading" className="text-white text-3xl md:text-4xl font-light mb-16 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto">
            {about.values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-white text-xl mb-4">{value.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

// ============ LOOKBOOK PAGE - EDITORIAL STYLE ============
function LookbookPage() {
  const lookbook = lookbookContent;
  const campaignImages = getCampaignImages();

  return (
    <article className="min-h-screen bg-black pt-24">
      <div className="px-6 lg:px-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-white text-5xl md:text-7xl font-light mb-4">{lookbook.title}</h1>
          <p className="text-white/50 text-sm tracking-wider">{lookbook.subtitle}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pb-1" role="list" aria-label="Lookbook images">
        {campaignImages.map((image, index) => (
          <motion.figure
            key={image.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`overflow-hidden ${index % 3 === 0 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'}`}
            role="listitem"
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            />
          </motion.figure>
        ))}
      </div>
    </article>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], total: 0, checkoutUrl: '' });
  const [cartCount, setCartCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [currentBrand, setCurrentBrand] = useState(defaultBrand);

  // Detect brand from domain on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detectedBrand = detectBrandFromDomain(window.location.hostname);
      setCurrentBrand(detectedBrand);
    }
  }, []);

  // Get current brand config
  const brand = getBrand(currentBrand);

  // Handle brand change
  const handleBrandChange = useCallback((brandId) => {
    setCurrentBrand(brandId);
    setCurrentPage('home');
    setSelectedProduct(null);
    setSelectedCollection(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initialize cart on mount
  useEffect(() => {
    async function initCart() {
      setIsCartLoading(true);
      try {
        const initializedCart = await initializeCart();
        setCart(initializedCart);
        setCartCount(getCartItemCount());
      } catch (error) {
        console.error('[App] Cart initialization failed:', error);
        const localCart = getCart();
        setCart(localCart);
        setCartCount(getCartItemCount());
      } finally {
        setIsCartLoading(false);
      }
    }
    initCart();
  }, []);

  // Load featured products
  useEffect(() => {
    async function loadFeatured() {
      setIsLoadingFeatured(true);
      try {
        const products = await getProducts(8);
        setFeaturedProducts(products);
      } catch (err) {
        console.error('Error loading featured products:', err);
        setFeaturedProducts(getFeaturedProducts(8));
      } finally {
        setIsLoadingFeatured(false);
      }
    }
    loadFeatured();
  }, []);

  const handleNavigate = useCallback((page, collection = null) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setSelectedCollection(collection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleProductClick = useCallback((productId, collectionId = null) => {
    if (collectionId) {
      setSelectedCollection(collectionId);
      setCurrentPage('collections');
    } else if (productId) {
      setSelectedProduct(productId);
      setCurrentPage('product');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCollectionChange = useCallback((collectionId) => {
    setSelectedCollection(collectionId);
  }, []);

  const handleAddToCart = useCallback(async (product, color, size) => {
    const updatedCart = await addToCart(product, color, size);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
    setIsCartOpen(true);
  }, []);

  const handleUpdateQuantity = useCallback(async (itemKey, quantity) => {
    const updatedCart = await updateQuantity(itemKey, quantity);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
  }, []);

  const handleRemoveItem = useCallback(async (itemKey) => {
    const updatedCart = await removeFromCart(itemKey);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
  }, []);
  
  const handleCartRefresh = useCallback(async () => {
    const refreshedCart = await initializeCart();
    setCart(refreshedCart);
    setCartCount(getCartItemCount());
  }, []);

  // Get hero products from content config
  const heroConfig = homepage.featuredSections.productHero1;
  const secondHeroConfig = homepage.featuredSections.productHero2;
  const heroProduct = featuredProducts.find(p => p.id === heroConfig.productId) || featuredProducts[heroConfig.fallbackIndex];
  const secondHeroProduct = featuredProducts.find(p => p.id === secondHeroConfig.productId) || featuredProducts[secondHeroConfig.fallbackIndex];
  const essentialsCollection = mockCollections[0];

  return (
    <div className="min-h-screen bg-black">
      <Navigation
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
        onNavigate={handleNavigate}
        isTransparent={currentPage === 'home'}
        currentBrand={currentBrand}
        onBrandChange={handleBrandChange}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onRefresh={handleCartRefresh}
      />

      <main id="main-content" tabIndex={-1}>
        {currentPage === 'home' && (
          <>
            <HeroSection onShopClick={() => handleNavigate('collections')} />
            <ProductHero product={heroProduct} onBuyClick={handleProductClick} />
            <ProductCarousel 
              title={homepage.featuredSections.carousels[0].title}
              products={featuredProducts} 
              onProductClick={handleProductClick}
              isLoading={isLoadingFeatured}
            />
            <CollectionShowcase collection={essentialsCollection} onExplore={(id) => handleNavigate('collections', id)} />
            <BrandStatement onLearnMore={() => handleNavigate('about')} />
            <PressSection />
            <ProductHero product={secondHeroProduct} onBuyClick={handleProductClick} reverse />
            <ProductCarousel 
              title={homepage.featuredSections.carousels[1].title}
              products={featuredProducts.slice(4, 12)} 
              onProductClick={handleProductClick}
              isLoading={isLoadingFeatured}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {currentPage === 'collections' && (
          <>
            <CollectionsPage
              onProductClick={handleProductClick}
              selectedCollection={selectedCollection}
              onCollectionChange={handleCollectionChange}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {currentPage === 'product' && (
          <>
            <ProductPage
              productId={selectedProduct}
              onAddToCart={handleAddToCart}
              onBack={() => handleNavigate('collections')}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {currentPage === 'about' && (
          <>
            <AboutPage />
            <Footer onNavigate={handleNavigate} />
          </>
        )}

        {currentPage === 'lookbook' && (
          <>
            <LookbookPage />
            <Footer onNavigate={handleNavigate} />
          </>
        )}
      </main>
    </div>
  );
}
