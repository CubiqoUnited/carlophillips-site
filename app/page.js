'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ShoppingBag, ChevronLeft, ChevronRight, Plus, Minus, ArrowRight, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
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
import { getCart, addToCart, removeFromCart, updateQuantity, getCartItemCount, getCheckoutUrl } from '@/lib/store/cart';

// ============ PREMIUM LOADING COMPONENT ============
function LoadingSpinner({ size = 'default', text = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
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
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-white/5 mb-4" />
      <div className="h-4 bg-white/5 w-3/4 mb-2" />
      <div className="h-3 bg-white/5 w-1/2 mb-2" />
      <div className="h-4 bg-white/5 w-1/4" />
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Image Skeleton */}
        <div className="relative h-screen lg:sticky lg:top-0 bg-white/5 animate-pulse" />
        
        {/* Content Skeleton */}
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
    >
      <div className="w-16 h-16 border border-white/20 flex items-center justify-center mb-6">
        <X className="w-6 h-6 text-white/40" strokeWidth={1} />
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
        <ShoppingBag className="w-6 h-6 text-white/40" strokeWidth={1} />
      </div>
      <h3 className="text-white text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 text-sm max-w-md">{description}</p>
      )}
    </motion.div>
  );
}

// ============ NAVIGATION COMPONENT - VOLLEBAK STYLE ============
function Navigation({ onCartClick, cartCount, onNavigate, isTransparent = true }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
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
      >
        <nav className="flex items-center justify-between px-6 lg:px-10 h-16 lg:h-20">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white hover:opacity-60 transition-opacity flex items-center gap-3"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
            <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">Menu</span>
          </button>

          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <h1 className="text-white text-sm md:text-base tracking-[0.4em] font-light uppercase">
              Carlophillips
            </h1>
          </button>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="text-white hover:opacity-60 transition-opacity flex items-center gap-3"
          >
            <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">
              Bag {cartCount > 0 && `(${cartCount})`}
            </span>
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </nav>
      </motion.header>

      {/* Full Screen Menu - Vollebak Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <div className="h-full flex flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-6 lg:px-10 h-16 lg:h-20">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:opacity-60 transition-opacity flex items-center gap-3"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                  <span className="hidden md:inline text-xs tracking-[0.2em] uppercase">Close</span>
                </button>
                <h1 className="text-white text-sm md:text-base tracking-[0.4em] font-light uppercase">
                  Carlophillips
                </h1>
                <div className="w-20" />
              </div>

              {/* Menu Content */}
              <div className="flex-1 flex items-center justify-center">
                <nav className="text-center space-y-2">
                  {[
                    { id: 'home', label: 'Home' },
                    { id: 'collections', label: 'Shop All' },
                    { id: 'essentials', label: 'Essentials', collection: true },
                    { id: 'outerwear', label: 'Outerwear', collection: true },
                    { id: 'jewelry', label: 'Jewelry & Watches', collection: true },
                    { id: 'accessories', label: 'Accessories', collection: true },
                    { id: 'home-collection', label: 'Home & Living', collection: true },
                    { id: 'about', label: 'About' },
                    { id: 'lookbook', label: 'Lookbook' },
                  ].map((item, index) => (
                    <motion.div
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
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Menu Footer */}
              <div className="px-6 lg:px-10 py-8 border-t border-white/10">
                <div className="flex justify-between items-center text-white/50 text-xs tracking-[0.15em] uppercase">
                  <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">TikTok</a>
                  </div>
                  <span>Free shipping over $200</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============ CART SIDEBAR - PREMIUM STYLE ============
function CartSidebar({ isOpen, onClose, cart = { items: [], total: 0 }, onUpdateQuantity, onRemoveItem }) {
  const items = cart?.items || [];
  const total = cart?.total || 0;
  const checkoutUrl = getCheckoutUrl();
  
  const handleCheckout = () => {
    if (checkoutUrl && checkoutUrl !== '/checkout') {
      window.location.href = checkoutUrl;
    } else {
      alert('Checkout will be available when Shopify is connected');
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
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-black text-white"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
                <h2 className="text-sm tracking-[0.3em] uppercase">Your Bag ({items.length})</h2>
                <button onClick={onClose} className="hover:opacity-60 transition-opacity">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 mb-6 text-white/30" strokeWidth={1} />
                    <p className="text-white/50 text-sm tracking-wider">Your bag is empty</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={item.key} className="flex gap-6">
                        <div className="w-28 h-36 bg-neutral-900 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm tracking-wide mb-1">{item.name}</h3>
                          <p className="text-xs text-white/50 mb-3">{item.color} / {item.size}</p>
                          <p className="text-sm mb-4">${item.price}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
                              className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
                              className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(item.key)}
                              className="ml-auto text-xs text-white/50 hover:text-white transition-colors tracking-wider uppercase"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-white/10 p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-white/40">Shipping calculated at checkout</p>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-white text-black text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============ FULL-BLEED HERO SECTION - VOLLEBAK STYLE ============
function HeroSection({ onShopClick, videoUrl }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const placeholderVideo = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video/Image Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        {videoUrl ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl || placeholderVideo} type="video/mp4" />
          </video>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-70"
          >
            <source src={placeholderVideo} type="video/mp4" />
          </video>
        )}
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

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
            Summer 2025 Collection
          </p>
          <h1 className="text-white text-5xl md:text-7xl lg:text-[8rem] font-light leading-[0.9] mb-6 lg:mb-8 tracking-tight">
            Quiet<br />Luxury
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-lg mb-8 lg:mb-10 leading-relaxed">
            A curated collection of timeless essentials. Designed for those who appreciate understated elegance and uncompromising quality.
          </p>
          <button
            onClick={onShopClick}
            className="group inline-flex items-center gap-4 text-white text-xs tracking-[0.25em] uppercase border-b border-white/30 pb-2 hover:border-white transition-colors"
          >
            Shop Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
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
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
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
      {/* Full Image */}
      <div className="absolute inset-0">
        <img
          src={product.heroImage || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 ${reverse ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/80 via-black/40 to-transparent`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content */}
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
            <ArrowRight className="w-4 h-4" />
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
      <section className="py-16 lg:py-24 bg-black">
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
    <section className="py-16 lg:py-24 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-16 mb-8 lg:mb-12">
        <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm tracking-wider">
            {String(currentIndex + 1).padStart(2, '0')} / {String(carouselProducts.length).padStart(2, '0')}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => scrollTo('left')}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollTo('right')}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
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
      >
        {carouselProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onProductClick(product.id)}
            className="flex-shrink-0 w-72 lg:w-80 cursor-pointer group"
          >
            <div className="aspect-[3/4] overflow-hidden bg-neutral-900 mb-4 relative">
              <img
                src={product.images?.[0] || product.heroImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
            <h3 className="text-white text-sm tracking-wide mb-1">{product.name}</h3>
            <p className="text-white/40 text-xs mb-2 line-clamp-2">{product.tagline || product.description?.slice(0, 60)}...</p>
            <p className="text-white text-sm">${product.price}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============ BRAND STATEMENT SECTION ============
function BrandStatement({ onLearnMore }) {
  return (
    <section className="py-24 lg:py-40 bg-black">
      <div className="max-w-5xl mx-auto px-6 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-8">Our Philosophy</p>
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8 tracking-tight">
            We design clothes for people who value quality over quantity, substance over trends.
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Every piece is crafted with intention, using premium materials sourced from ethical suppliers. 
            We partner with print-on-demand and dropshipping services that share our commitment to sustainability.
          </p>
          <button 
            onClick={onLearnMore}
            className="inline-flex items-center gap-3 text-white text-xs tracking-[0.25em] uppercase border-b border-white/30 pb-2 hover:border-white transition-colors"
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ PRESS LOGOS SECTION - VOLLEBAK STYLE ============
function PressSection() {
  const pressItems = [
    { name: 'VOGUE', quote: '"Understated luxury at its finest"' },
    { name: 'GQ', quote: '"The future of sustainable fashion"' },
    { name: 'HYPEBEAST', quote: '"Minimal, intentional, perfect"' },
    { name: 'HIGHSNOBIETY', quote: '"Quality that speaks for itself"' },
  ];

  return (
    <section className="py-16 bg-black border-y border-white/10">
      <div className="overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 lg:gap-24 whitespace-nowrap"
        >
          {[...pressItems, ...pressItems, ...pressItems].map((item, index) => (
            <div key={index} className="flex items-center gap-4 lg:gap-6">
              <span className="text-white/30 text-2xl lg:text-3xl font-light tracking-[0.2em]">{item.name}</span>
              <span className="text-white/50 text-sm italic">{item.quote}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ COLLECTION SHOWCASE - VOLLEBAK STYLE ============
function CollectionShowcase({ collection, onExplore }) {
  if (!collection) return null;
  
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src={collection.image}
          alt={collection.name}
          className="w-full h-full object-cover opacity-80"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      
      <div className="absolute inset-0 flex items-end p-6 lg:p-16 pb-16 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-white text-4xl md:text-5xl lg:text-6xl font-light mb-4">{collection.name}</h3>
          <p className="text-white/60 text-sm md:text-base uppercase tracking-[0.15em] mb-6 max-w-md">
            {collection.description}
          </p>
          <button
            onClick={() => onExplore(collection.id)}
            className="inline-flex items-center gap-3 text-white text-xs tracking-[0.25em] uppercase border border-white/30 px-8 py-4 hover:bg-white hover:text-black transition-all"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER - PREMIUM STYLE ============
function Footer() {
  return (
    <footer className="bg-black text-white py-16 lg:py-24 border-t border-white/10">
      <div className="px-6 lg:px-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="text-2xl tracking-[0.3em] font-light mb-6">CARLOPHILLIPS</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              A modern luxury lifestyle brand. Premium clothing, jewelry, accessories, and home items 
              designed for those who appreciate understated elegance.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-white/70">Shop</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Essentials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Outerwear</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Home & Living</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-white/70">Company</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">© 2025 Carlophillips. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
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

  // Load collection and products
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedCollection) {
          // Load specific collection
          const collectionData = await getCollectionAsync(selectedCollection);
          setCollection(collectionData);
          
          // Load products for this collection
          const products = await getProductsByCollectionAsync(selectedCollection);
          setDisplayProducts(products);
        } else {
          // Load all products
          setCollection(null);
          const products = await getProducts();
          setDisplayProducts(products);
        }
      } catch (err) {
        console.error('Error loading collection data:', err);
        setError('Failed to load products. Please try again.');
        
        // Fallback to mock data
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
    // Re-trigger the effect
    const timer = setTimeout(() => {
      window.location.reload();
    }, 100);
  };

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
              {collection ? collection.name : 'All Products'}
            </h1>
            {isLoading && <LoadingSpinner size="small" />}
          </div>
          <p className="text-white/50 text-sm md:text-base max-w-xl">
            {collection ? collection.description : 'Explore our complete collection of luxury essentials'}
          </p>
          {isUsingShopify() && (
            <p className="text-green-500/60 text-xs mt-2 tracking-wider">● Connected to Shopify</p>
          )}
        </motion.div>

        {/* Collection Filter */}
        {!selectedCollection && (
          <div className="flex flex-wrap gap-3 mt-8">
            {allCollections.map((col) => (
              <button
                key={col.id}
                onClick={() => onCollectionChange(col.id)}
                className="px-5 py-2 text-xs tracking-[0.15em] uppercase border border-white/20 text-white/70 hover:bg-white hover:text-black transition-all"
              >
                {col.name}
              </button>
            ))}
          </div>
        )}

        {/* Back to all button when in collection */}
        {selectedCollection && (
          <button
            onClick={() => onCollectionChange(null)}
            className="mt-6 text-white/50 text-xs tracking-wider uppercase hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
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
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 px-6 lg:px-16 pb-24">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => onProductClick(product.id)}
              className="cursor-pointer group"
            >
              <div className="aspect-[3/4] overflow-hidden bg-neutral-900 mb-4 relative">
                <img
                  src={product.images?.[0] || product.heroImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs tracking-wider uppercase">Quick View</span>
                </div>
              </div>
              <h3 className="text-white text-sm tracking-wide mb-1">{product.name}</h3>
              <p className="text-white/40 text-xs mb-2 line-clamp-1">{product.tagline || ''}</p>
              <p className="text-white text-sm">${product.price}</p>
            </motion.div>
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

  // Load product data
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
        
        // Try fallback to mock data
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

  // Loading State
  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  // Error State
  if (error && !product) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <ErrorState message={error} onRetry={onBack} />
      </div>
    );
  }

  // No product
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
            <img
              src={product.images?.[currentImage] || product.heroImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Image Navigation */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImage === index ? 'bg-white w-6' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 lg:p-16 flex flex-col justify-center">
          <button
            onClick={onBack}
            className="text-white/50 text-xs tracking-wider uppercase mb-8 hover:text-white transition-colors self-start flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
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
            <p className="text-white text-2xl mb-8">${product.price}</p>
            
            {/* Tagline */}
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
              <div className="mb-8">
                <p className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">
                  Color — {selectedColor}
                </p>
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
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.variants?.sizes && product.variants.sizes.length > 0 && product.variants.sizes[0] !== 'One Size' && (
              <div className="mb-10">
                <p className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">
                  Size — {selectedSize}
                </p>
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
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
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
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                  Added to Bag
                </>
              ) : (
                'Add to Bag'
              )}
            </button>

            {/* Shopify indicator */}
            {isUsingShopify() && (
              <p className="text-green-500/60 text-xs mt-4 text-center tracking-wider">● Live Shopify Data</p>
            )}

            {/* Product Details */}
            {product.details && product.details.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-white/50 text-xs tracking-[0.15em] uppercase mb-4">Details</h3>
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
  return (
    <div className="min-h-screen bg-black pt-24">
      {/* Hero */}
      <section className="h-[60vh] relative">
        <img
          src="https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=1600&q=80"
          alt="About"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-end p-6 lg:p-16 pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-5xl md:text-7xl lg:text-8xl font-light"
          >
            About Us
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 lg:py-32 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-12">
              Carlophillips was founded on a simple principle: that luxury should be accessible, 
              sustainable, and timeless.
            </p>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              We reject the notion that quality must come at the expense of our values. 
              Every piece in our collection is designed with intention, using premium materials 
              sourced from ethical suppliers.
            </p>
            <p className="text-white/50 text-base leading-relaxed">
              We work with print-on-demand and dropshipping partners who share our commitment 
              to reducing waste and environmental impact. Our goal is to create pieces that 
              you'll cherish for years—not seasons.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 border-t border-white/10">
        <div className="px-6 lg:px-16">
          <h2 className="text-white text-3xl md:text-4xl font-light mb-16 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto">
            {[
              { title: 'Sustainability', desc: 'We produce only what is ordered, eliminating overproduction.' },
              { title: 'Quality', desc: 'Premium materials and expert craftsmanship in every piece.' },
              { title: 'Timelessness', desc: 'Designs meant to last—both in construction and style.' },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-white text-xl mb-4">{value.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ LOOKBOOK PAGE - EDITORIAL STYLE ============
function LookbookPage() {
  const images = [
    'https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=1200&q=80',
    'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=1200&q=80',
    'https://images.pexels.com/photos/6070179/pexels-photo-6070179.jpeg?w=1200',
    'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=1200&q=80',
    'https://images.unsplash.com/photo-1550029402-8280f657d8d1?w=1200&q=80',
    'https://images.pexels.com/photos/2986445/pexels-photo-2986445.jpeg?w=1200',
  ];

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="px-6 lg:px-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-white text-5xl md:text-7xl font-light mb-4">Lookbook</h1>
          <p className="text-white/50 text-sm tracking-wider">Summer 2025</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pb-1">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`overflow-hidden ${index % 3 === 0 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'}`}
          >
            <img
              src={image}
              alt={`Lookbook ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = getCart();
    setCart(savedCart);
    setCartCount(getCartItemCount());
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

  const handleNavigate = (page, collection = null) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setSelectedCollection(collection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId, collectionId = null) => {
    if (collectionId) {
      setSelectedCollection(collectionId);
      setCurrentPage('collections');
    } else if (productId) {
      setSelectedProduct(productId);
      setCurrentPage('product');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(collectionId);
  };

  const handleAddToCart = async (product, color, size) => {
    const updatedCart = await addToCart(product, color, size);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = async (itemKey, quantity) => {
    const updatedCart = await updateQuantity(itemKey, quantity);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
  };

  const handleRemoveItem = async (itemKey) => {
    const updatedCart = await removeFromCart(itemKey);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
  };

  // Get hero products
  const heroProduct = featuredProducts.find(p => p.id === 'bomber-jacket') || featuredProducts[4];
  const secondHeroProduct = featuredProducts.find(p => p.id === 'oversized-hoodie') || featuredProducts[1];
  const essentialsCollection = mockCollections[0];

  return (
    <div className="min-h-screen bg-black">
      <Navigation
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
        onNavigate={handleNavigate}
        isTransparent={currentPage === 'home'}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <main>
        {currentPage === 'home' && (
          <>
            <HeroSection onShopClick={() => handleNavigate('collections')} />
            <ProductHero product={heroProduct} onBuyClick={handleProductClick} />
            <ProductCarousel 
              title="Featured Products" 
              products={featuredProducts} 
              onProductClick={handleProductClick}
              isLoading={isLoadingFeatured}
            />
            <CollectionShowcase collection={essentialsCollection} onExplore={(id) => handleNavigate('collections', id)} />
            <BrandStatement onLearnMore={() => handleNavigate('about')} />
            <PressSection />
            <ProductHero product={secondHeroProduct} onBuyClick={handleProductClick} reverse />
            <ProductCarousel 
              title="New Arrivals" 
              products={featuredProducts.slice(4, 12)} 
              onProductClick={handleProductClick}
              isLoading={isLoadingFeatured}
            />
            <Footer />
          </>
        )}

        {currentPage === 'collections' && (
          <>
            <CollectionsPage
              onProductClick={handleProductClick}
              selectedCollection={selectedCollection}
              onCollectionChange={handleCollectionChange}
            />
            <Footer />
          </>
        )}

        {currentPage === 'product' && (
          <>
            <ProductPage
              productId={selectedProduct}
              onAddToCart={handleAddToCart}
              onBack={() => handleNavigate('collections')}
            />
            <Footer />
          </>
        )}

        {currentPage === 'about' && (
          <>
            <AboutPage />
            <Footer />
          </>
        )}

        {currentPage === 'lookbook' && (
          <>
            <LookbookPage />
            <Footer />
          </>
        )}
      </main>
    </div>
  );
}
