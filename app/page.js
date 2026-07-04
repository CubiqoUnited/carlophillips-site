'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, ShoppingBag, X } from 'lucide-react';
import { canRenderProducts } from '@/lib/config/product-visibility';

const brands = ['CARLOPHILLIPS', 'loveCarlo', 'HouseOfCarlo'];

const editorialPanels = [
  {
    label: 'Apparel',
    title: 'Cut, weight, proportion.',
    body: 'The first apparel language is being edited around restraint and material presence.',
  },
  {
    label: 'Objects',
    title: 'Useful things with silence.',
    body: 'Accessories and daily objects will enter only when form, finish, and use are resolved.',
  },
  {
    label: 'Identity',
    title: 'A graphic system, not decoration.',
    body: 'Marks, scale, placement, and negative space are being treated as product decisions.',
  },
  {
    label: 'Future drop',
    title: 'Release by approval.',
    body: 'Nothing enters the store until media, construction, fulfillment, and pricing are ready.',
  },
];

const architectureModules = [
  'Product film',
  'Studio image',
  'Detail story',
  'Fit notes',
  'Material record',
  'Release page',
];

function AppShell() {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const productsVisible = canRenderProducts();

  const route = getRoute(pathname);

  return (
    <main id="main-content" className="min-h-screen bg-[#020202] text-white selection:bg-white selection:text-black">
      <Header onMenu={() => setMenuOpen(true)} onBag={() => setBagOpen(true)} />
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      {bagOpen && <BagOverlay onClose={() => setBagOpen(false)} />}

      {route === 'home' && <HomePage productsVisible={productsVisible} />}
      {route === 'collection' && <CollectionEmptyPage />}
      {route === 'product' && <ProductUnreleasedPage />}
      {route === 'about' && <AboutPage />}
      {route === 'bag' && <BagPage onBack={() => setBagOpen(true)} />}

      <Footer />
    </main>
  );
}

function getRoute(pathname) {
  if (pathname.startsWith('/products/')) return 'product';
  if (pathname.startsWith('/shop') || pathname.startsWith('/collections')) return 'collection';
  if (pathname.startsWith('/about') || pathname.startsWith('/lookbook')) return 'about';
  if (pathname.startsWith('/cart') || pathname.startsWith('/bag')) return 'bag';
  return 'home';
}

function Header({ onMenu, onBag }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <button
          type="button"
          onClick={onMenu}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" strokeWidth={1.4} />
        </button>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-xs tracking-[0.36em] text-white sm:text-sm md:hidden">
          CARLOPHILLIPS
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-[10px] uppercase tracking-[0.22em] text-white/45 md:flex" aria-label="Brand navigation">
          {brands.map((brand) => (
            <Link key={brand} href={brand === 'CARLOPHILLIPS' ? '/' : '/about'} className="transition hover:text-white">
              {brand}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={onBag}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white md:ml-8"
          aria-label="Open bag"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
        </button>
      </div>
    </header>
  );
}

function MenuOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 px-6 py-6 text-white">
      <div className="mx-auto flex max-w-[1600px] justify-between">
        <span className="text-xs tracking-[0.34em] text-white/60">CARLOPHILLIPS</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" strokeWidth={1.4} />
        </button>
      </div>
      <nav className="mx-auto mt-24 grid max-w-[1600px] gap-5 text-5xl font-light tracking-[-0.04em] sm:text-7xl lg:text-8xl" aria-label="Main menu">
        <Link onClick={onClose} href="/" className="text-white transition hover:text-white/55">Home</Link>
        <Link onClick={onClose} href="/shop" className="text-white transition hover:text-white/55">First drop</Link>
        <Link onClick={onClose} href="/collections" className="text-white transition hover:text-white/55">Collections</Link>
        <Link onClick={onClose} href="/about" className="text-white transition hover:text-white/55">Studio</Link>
      </nav>
    </div>
  );
}

function HomePage({ productsVisible }) {
  const releaseLine = productsVisible ? 'Approved releases enabled.' : 'Approved releases only.';

  return (
    <>
      <section className="relative flex min-h-screen items-end overflow-hidden border-b border-white/10 px-5 pb-12 pt-28 sm:px-8 lg:px-12 lg:pb-16">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
          <div className="absolute left-[12%] top-24 h-[72vh] w-px bg-white/10" />
          <div className="absolute right-[18%] top-36 h-[56vh] w-px bg-white/10" />
          <div className="absolute bottom-[22%] left-0 right-0 h-px bg-white/10" />
        </div>

        <div className="relative z-10 grid w-full max-w-[1800px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-8 text-[10px] uppercase tracking-[0.32em] text-white/45">Collection in preparation</p>
            <h1 className="max-w-5xl text-[18vw] font-light leading-[0.82] tracking-[-0.08em] sm:text-[15vw] lg:text-[9.5vw]">
              Gesture<br />of Luxury
            </h1>
          </div>

          <div className="max-w-xl lg:ml-auto">
            <p className="text-xl font-light leading-snug text-white/72 sm:text-2xl">
              An editorial product system for premium essentials, graphic restraint, and future-ready apparel.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-3 border border-white px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-black"
              >
                Preview the first drop
                <ArrowRight className="h-4 w-4" strokeWidth={1.3} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center border border-white/15 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white/65 transition hover:border-white/45 hover:text-white"
              >
                Enter the studio
              </Link>
            </div>
            <p className="mt-8 text-xs leading-relaxed text-white/35">{releaseLine}</p>
          </div>
        </div>
      </section>

      <ManifestoSection />
      <ProductSystemSection />
      <MediaArchitectureSection />
    </>
  );
}

function ManifestoSection() {
  return (
    <section className="border-b border-white/10 px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto grid max-w-[1700px] gap-12 lg:grid-cols-[0.45fr_1fr]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Editorial manifesto</p>
        <div className="space-y-12">
          <h2 className="max-w-6xl text-5xl font-light leading-[0.95] tracking-[-0.055em] text-white sm:text-7xl lg:text-8xl">
            Not merch. A product language.
          </h2>
          <div className="grid gap-8 text-lg leading-relaxed text-white/58 md:grid-cols-3">
            <p>Built around restraint, proportion, and material presence.</p>
            <p>The first drop is being prepared with a slower threshold for approval.</p>
            <p>Nothing public should feel unfinished, inflated, or louder than the object itself.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSystemSection() {
  return (
    <section className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/40">Product system placeholders</p>
            <h2 className="max-w-3xl text-4xl font-light tracking-[-0.045em] sm:text-6xl">Release architecture without exposed inventory.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/45">
            These panels reserve the hierarchy for future approved work without showing unfinished catalog assets.
          </p>
        </div>
        <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
          {editorialPanels.map((panel, index) => (
            <article key={panel.label} className="min-h-[360px] bg-[#050505] p-6 sm:p-8">
              <div className="mb-20 flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-white/36">
                <span>{panel.label}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mb-5 text-2xl font-light tracking-[-0.035em] text-white">{panel.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{panel.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaArchitectureSection() {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto grid max-w-[1700px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="flex min-h-[640px] flex-col justify-between border border-white/10 bg-[#060606] p-7 sm:p-10">
          <div>
            <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">Media-ready architecture</p>
            <h2 className="text-5xl font-light leading-[0.95] tracking-[-0.055em] sm:text-7xl">
              Built for the moment real assets arrive.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-white/52">
            The shell is prepared for film, studio photography, specification modules, and release storytelling without pretending those assets already exist.
          </p>
        </div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-2">
          {architectureModules.map((module, index) => (
            <div key={module} className="flex min-h-[190px] items-end justify-between bg-black p-6">
              <span className="text-lg font-light text-white/78">{module}</span>
              <span className="text-[10px] tracking-[0.24em] text-white/28">{String(index + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionEmptyPage() {
  return (
    <section className="flex min-h-screen items-center border-b border-white/10 px-5 pt-28 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-[1700px] gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">Collection room</p>
          <h1 className="max-w-5xl text-6xl font-light leading-[0.9] tracking-[-0.065em] sm:text-8xl lg:text-9xl">
            The first drop is being prepared.
          </h1>
        </div>
        <div className="max-w-xl lg:ml-auto">
          <p className="text-xl leading-relaxed text-white/58">
            Products will appear here after studio media, pricing, and fulfillment approval.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white/70 transition hover:border-white hover:text-white"
          >
            Return home
            <ArrowRight className="h-4 w-4" strokeWidth={1.3} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductUnreleasedPage() {
  return (
    <section className="flex min-h-screen items-center px-5 pt-28 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-[1700px] gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-center">
        <div className="aspect-[4/5] border border-white/10 bg-[#050505] p-6">
          <div className="flex h-full flex-col justify-between border border-white/10 p-6">
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/36">Unreleased object</span>
            <span className="max-w-xs text-sm leading-relaxed text-white/42">Media withheld until release approval.</span>
          </div>
        </div>
        <div>
          <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">Release gate</p>
          <h1 className="max-w-4xl text-6xl font-light leading-[0.9] tracking-[-0.065em] sm:text-8xl">
            This object has not entered release.
          </h1>
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-white/56">
            Product pages open only after media, pricing, and fulfillment approval.
          </p>
          <Link
            href="/shop"
            className="mt-10 inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white/70 transition hover:border-white hover:text-white"
          >
            View collection state
            <ArrowRight className="h-4 w-4" strokeWidth={1.3} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="px-5 pt-32 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1700px]">
        <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">Studio notes</p>
        <h1 className="max-w-6xl text-6xl font-light leading-[0.9] tracking-[-0.065em] sm:text-8xl lg:text-9xl">
          CARLOPHILLIPS is being composed.
        </h1>
        <div className="mt-20 grid gap-px bg-white/10 lg:grid-cols-3">
          {['Restraint', 'Proportion', 'Presence'].map((value) => (
            <article key={value} className="min-h-[300px] bg-[#050505] p-8">
              <h2 className="mb-8 text-3xl font-light tracking-[-0.04em]">{value}</h2>
              <p className="text-sm leading-relaxed text-white/52">
                A working principle for future releases, applied before anything becomes public.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BagPage({ onBack }) {
  return (
    <section className="flex min-h-screen items-center px-5 pt-28 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-3xl border border-white/10 bg-[#050505] p-8 sm:p-12">
        <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">Bag</p>
        <h1 className="text-5xl font-light tracking-[-0.055em] sm:text-7xl">Your bag is empty.</h1>
        <p className="mt-8 max-w-lg text-base leading-relaxed text-white/52">
          Releases are not open yet. The bag will activate when the first approved drop enters the store.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-10 inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white/70 transition hover:border-white hover:text-white"
        >
          View bag panel
        </button>
      </div>
    </section>
  );
}

function BagOverlay({ onClose }) {
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-white/10 bg-black p-6 text-white sm:w-[460px]" aria-label="Bag">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/55">Bag</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Close bag"
        >
          <X className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <h2 className="text-4xl font-light tracking-[-0.045em]">No release is open.</h2>
        <p className="mt-6 text-sm leading-relaxed text-white/48">
          The bag will remain empty until an approved object enters release.
        </p>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1700px] flex-col justify-between gap-8 text-[10px] uppercase tracking-[0.24em] text-white/35 md:flex-row">
        <div className="flex flex-wrap gap-5">
          {brands.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-5">
          <a href="mailto:hello@carlophillips.com" className="transition hover:text-white">Contact</a>
          <Link href="/bag" className="transition hover:text-white">Bag</Link>
        </div>
      </div>
    </footer>
  );
}

export default AppShell;
