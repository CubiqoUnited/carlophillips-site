'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Search, ChevronDown, Plus, Minus, ArrowRight, Play, Pause } from 'lucide-react';
import { collections, products, getProduct, getProductsByCollection, getCollection, getFeaturedProducts, getFeaturedCollections } from '@/lib/data/products';
import { getCart, addToCart, removeFromCart, updateQuantity, clearCart, getCartItemCount } from '@/lib/store/cart';

// ============ NAVIGATION COMPONENT ============
function Navigation({ onCartClick, cartCount, currentPage, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 hover:opacity-60 transition-opacity"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <h1 className="luxury-heading text-xl md:text-2xl tracking-[0.3em]">
                CARLOPHILLIPS
              </h1>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:opacity-60 transition-opacity hidden md:block">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={onCartClick}
                className="p-2 -mr-2 hover:opacity-60 transition-opacity relative"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-background"
          >
            <div className="container mx-auto px-6 lg:px-12 h-full">
              <div className="flex items-center justify-between h-20">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -ml-2 hover:opacity-60 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
                <h1 className="luxury-heading text-xl md:text-2xl tracking-[0.3em]">
                  CARLOPHILLIPS
                </h1>
                <div className="w-9" />
              </div>

              <div className="flex flex-col justify-center h-[calc(100%-5rem)] pb-20">
                <nav className="space-y-6">
                  {[
                    { id: 'home', label: 'Home' },
                    { id: 'collections', label: 'Collections' },
                    { id: 'about', label: 'About' },
                    { id: 'lookbook', label: 'Lookbook' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <button
                        onClick={() => {
                          onNavigate(item.id);
                          setIsMenuOpen(false);
                        }}
                        className="block text-4xl md:text-6xl font-light tracking-wide hover:opacity-60 transition-opacity"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      >
                        {item.label}
                      </button>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-16 pt-8 border-t border-border"
                >
                  <div className="flex gap-8 text-sm tracking-wider text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
                    <a href="#" className="hover:text-foreground transition-colors">Pinterest</a>
                    <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============ CART SIDEBAR COMPONENT ============
function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-background border-l border-border"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-border">
                <h2 className="luxury-heading text-lg tracking-[0.2em]">Your Bag</h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 hover:opacity-60 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-auto p-6">
                {cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground luxury-text">Your bag is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.items.map((item) => (
                      <div key={item.key} className="flex gap-4">
                        <div className="w-24 h-32 bg-muted overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.color} / {item.size}
                          </p>
                          <p className="text-sm mt-2">${item.price}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
                              className="p-1 hover:opacity-60 transition-opacity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
                              className="p-1 hover:opacity-60 transition-opacity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.key)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.items.length > 0 && (
                <div className="border-t border-border p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shipping and taxes calculated at checkout
                  </p>
                  <button className="w-full luxury-button bg-foreground text-background hover:bg-foreground/90">
                    Checkout
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full luxury-button border border-border hover:bg-muted"
                  >
                    Continue Shopping
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

// ============ VIDEO HERO COMPONENT ============
function VideoHero({ onShopClick }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Placeholder video - user can replace with their own
  const placeholderVideo = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-60' : 'opacity-0'
          }`}
        >
          <source src={placeholderVideo} type="video/mp4" />
        </video>
        {/* Fallback gradient if video doesn't load */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black" />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="text-white/70 text-xs tracking-[0.3em] uppercase mb-4">
            Summer 2025 Collection
          </p>
          <h2
            className="text-white text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] mb-8"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Quiet<br />Luxury
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-md luxury-text mb-8">
            A curated collection of timeless essentials designed for those who appreciate understated elegance.
          </p>
          <button
            onClick={onShopClick}
            className="luxury-button bg-white text-black hover:bg-white/90 inline-flex items-center gap-3"
          >
            Shop Collection
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Video Controls */}
        <div className="absolute bottom-8 right-6 lg:right-12">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0"
          />
        </motion.div>
      </div>
    </section>
  );
}

// ============ COLLECTIONS GRID COMPONENT ============
function CollectionsGrid({ onCollectionClick }) {
  const featuredCollections = getFeaturedCollections();

  return (
    <section className="py-24 px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="luxury-heading text-3xl md:text-4xl mb-4">Collections</h2>
        <p className="text-muted-foreground luxury-text max-w-xl mx-auto">
          Explore our curated selections, each piece thoughtfully designed for the modern individual.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {featuredCollections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`relative overflow-hidden cursor-pointer group ${
              index === 0 ? 'md:col-span-2 h-[60vh]' : 'h-[50vh]'
            }`}
            onClick={() => onCollectionClick(collection.id)}
          >
            <div className="absolute inset-0 bg-black">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
              <h3 className="text-white luxury-heading text-2xl md:text-3xl mb-2">
                {collection.name}
              </h3>
              <p className="text-white/70 text-sm luxury-text mb-4 max-w-md">
                {collection.description}
              </p>
              <span className="text-white text-xs tracking-[0.2em] uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============ FEATURED PRODUCTS COMPONENT ============
function FeaturedProducts({ onProductClick }) {
  const featured = getFeaturedProducts(4);

  return (
    <section className="py-24 px-6 lg:px-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="luxury-heading text-3xl md:text-4xl mb-4">Featured</h2>
        <p className="text-muted-foreground luxury-text">
          Handpicked pieces from our latest collections
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
        {featured.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onProductClick(product.id)}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <h3 className="text-sm font-medium mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground">${product.price}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============ BRAND STORY COMPONENT ============
function BrandStory() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
              Our Philosophy
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-8"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Less, but better.
            </h2>
            <p className="luxury-text text-muted-foreground mb-6">
              Carlophillips is built on the belief that true luxury lies in simplicity. 
              Each piece in our collection is designed with intention, crafted to 
              transcend seasons and trends.
            </p>
            <p className="luxury-text text-muted-foreground mb-8">
              We partner with ethical manufacturers and prioritize sustainable practices, 
              because luxury should never come at the cost of our planet.
            </p>
            <button className="luxury-button border border-foreground hover:bg-foreground hover:text-background transition-colors">
              Learn More
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=800&q=80"
                alt="Brand story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-muted" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============ FOOTER COMPONENT ============
function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="luxury-heading text-2xl tracking-[0.3em] mb-6">CARLOPHILLIPS</h3>
            <p className="luxury-text text-background/70 max-w-sm">
              A modern luxury lifestyle brand for those who appreciate understated elegance and timeless design.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">All Products</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Essentials</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Outerwear</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Accessories</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Home</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">About</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/50">
            © 2025 Carlophillips. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-background/50">
            <a href="#" className="hover:text-background transition-colors">Privacy</a>
            <a href="#" className="hover:text-background transition-colors">Terms</a>
            <a href="#" className="hover:text-background transition-colors">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============ COLLECTIONS PAGE ============
function CollectionsPage({ onProductClick, onCollectionClick, selectedCollection }) {
  const collection = selectedCollection ? getCollection(selectedCollection) : null;
  const displayProducts = selectedCollection 
    ? getProductsByCollection(selectedCollection)
    : products;

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="luxury-heading text-4xl md:text-5xl mb-4">
          {collection ? collection.name : 'All Products'}
        </h1>
        <p className="text-muted-foreground luxury-text max-w-xl mx-auto">
          {collection ? collection.description : 'Explore our complete collection of luxury essentials'}
        </p>
      </motion.div>

      {/* Collection Filter */}
      {!selectedCollection && (
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => onCollectionClick(col.id)}
              className="px-6 py-2 text-xs tracking-[0.15em] uppercase border border-border hover:bg-foreground hover:text-background transition-colors"
            >
              {col.name}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group cursor-pointer"
            onClick={() => onProductClick(product.id)}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <button 
                className="absolute bottom-4 left-4 right-4 luxury-button bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick(product.id);
                }}
              >
                Quick View
              </button>
            </div>
            <h3 className="text-sm font-medium mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground">${product.price}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ PRODUCT PAGE ============
function ProductPage({ productId, onAddToCart, onBack }) {
  const product = getProduct(productId);
  const [selectedColor, setSelectedColor] = useState(product?.variants?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.variants?.sizes?.[0] || '');
  const [currentImage, setCurrentImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) {
    return (
      <div className="pt-28 pb-24 px-6 lg:px-12 min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(product, selectedColor, selectedSize);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to collection
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-[3/4] overflow-hidden bg-muted mb-4">
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-24 overflow-hidden border-2 transition-colors ${
                      currentImage === index ? 'border-foreground' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:py-8"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              {getCollection(product.collection)?.name}
            </p>
            <h1
              className="text-3xl md:text-4xl font-light mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {product.name}
            </h1>
            <p className="text-xl mb-8">${product.price}</p>

            <p className="luxury-text text-muted-foreground mb-8">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.variants?.colors && (
              <div className="mb-6">
                <p className="text-xs tracking-[0.15em] uppercase mb-3">Color: {selectedColor}</p>
                <div className="flex gap-3">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs border transition-colors ${
                        selectedColor === color
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.variants?.sizes && product.variants.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <p className="text-xs tracking-[0.15em] uppercase mb-3">Size: {selectedSize}</p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 text-xs border transition-colors ${
                        selectedSize === size
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
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
              className="w-full luxury-button bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 mb-4"
            >
              {isAdding ? 'Added!' : 'Add to Bag'}
            </button>

            {/* Product Details */}
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-xs tracking-[0.15em] uppercase mb-4">Details</h3>
              <ul className="space-y-2">
                {product.details?.map((detail, index) => (
                  <li key={index} className="text-sm text-muted-foreground luxury-text">
                    • {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============ ABOUT PAGE ============
function AboutPage() {
  return (
    <div className="pt-28 pb-24 min-h-screen">
      {/* Hero */}
      <section className="px-6 lg:px-12 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1
            className="text-5xl md:text-7xl font-light mb-8"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            About Carlophillips
          </h1>
          <p className="luxury-text text-muted-foreground text-lg">
            We believe in the power of thoughtful design to transform everyday moments into experiences of quiet luxury.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="px-6 lg:px-12 mb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 max-w-6xl mx-auto items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/5] overflow-hidden bg-muted"
          >
            <img
              src="https://images.unsplash.com/photo-1564518160120-94178fcdf5d4?w=800&q=80"
              alt="Our Story"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="luxury-heading text-2xl mb-6">Our Story</h2>
            <p className="luxury-text text-muted-foreground mb-6">
              Carlophillips was founded on a simple principle: that luxury should be accessible, 
              sustainable, and timeless. We reject the notion that quality must come at the expense 
              of our values.
            </p>
            <p className="luxury-text text-muted-foreground mb-6">
              Every piece in our collection is designed with intention, using premium materials 
              sourced from ethical suppliers. We work with print-on-demand and dropshipping partners 
              who share our commitment to reducing waste and environmental impact.
            </p>
            <p className="luxury-text text-muted-foreground">
              Our goal is to create pieces that you'll cherish for years—not seasons—crafted 
              with care and designed to transcend fleeting trends.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="luxury-heading text-2xl text-center mb-16"
          >
            Our Values
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Sustainability',
                description: 'We produce only what is ordered, eliminating overproduction and reducing waste in the fashion industry.',
              },
              {
                title: 'Quality',
                description: 'Premium materials and expert craftsmanship ensure every piece meets our exacting standards.',
              },
              {
                title: 'Timelessness',
                description: 'We design pieces meant to last—both in construction and style. No fast fashion here.',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-lg font-medium mb-4">{value.title}</h3>
                <p className="luxury-text text-muted-foreground text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ LOOKBOOK PAGE ============
function LookbookPage() {
  const lookbookImages = [
    'https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=800&q=80',
    'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=800&q=80',
    'https://images.pexels.com/photos/6070179/pexels-photo-6070179.jpeg?w=800',
    'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=800&q=80',
    'https://images.unsplash.com/photo-1550029402-8280f657d8d1?w=800&q=80',
    'https://images.pexels.com/photos/2986445/pexels-photo-2986445.jpeg?w=800',
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 px-6"
      >
        <h1
          className="text-5xl md:text-7xl font-light mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Lookbook
        </h1>
        <p className="text-muted-foreground luxury-text">Summer 2025</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 max-w-7xl mx-auto">
        {lookbookImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`overflow-hidden ${
              index % 3 === 0 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-[3/4]'
            }`}
          >
            <img
              src={image}
              alt={`Lookbook ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN APP COMPONENT ============
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [cartCount, setCartCount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = getCart();
    setCart(savedCart);
    setCartCount(getCartItemCount());
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setSelectedCollection(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId) => {
    setSelectedProduct(productId);
    setCurrentPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollectionClick = (collectionId) => {
    setSelectedCollection(collectionId);
    setCurrentPage('collections');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product, color, size) => {
    const updatedCart = addToCart(product, color, size);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemKey, quantity) => {
    const updatedCart = updateQuantity(itemKey, quantity);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
  };

  const handleRemoveItem = (itemKey) => {
    const updatedCart = removeFromCart(itemKey);
    setCart(updatedCart);
    setCartCount(getCartItemCount());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
        currentPage={currentPage}
        onNavigate={handleNavigate}
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
            <VideoHero onShopClick={() => handleNavigate('collections')} />
            <CollectionsGrid onCollectionClick={handleCollectionClick} />
            <FeaturedProducts onProductClick={handleProductClick} />
            <BrandStory />
            <Footer />
          </>
        )}

        {currentPage === 'collections' && (
          <>
            <CollectionsPage
              onProductClick={handleProductClick}
              onCollectionClick={handleCollectionClick}
              selectedCollection={selectedCollection}
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
