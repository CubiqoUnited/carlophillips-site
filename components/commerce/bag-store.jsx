'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BAG_STORAGE_KEY,
  addLine,
  applyDiscount,
  bagLineKey,
  clearBag,
  emptyBag,
  readBag,
  removeLine,
  setQuantity,
} from '../../lib/commerce/client-bag.js';

const BAG_EVENT = 'cp-bag-change';

function loadBag() {
  try {
    return readBag(JSON.parse(window.localStorage.getItem(BAG_STORAGE_KEY) || 'null'));
  } catch {
    return emptyBag;
  }
}

function persistBag(bag) {
  try {
    window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bag));
  } catch {
    /* A browser with storage disabled keeps the bag for this page view only. */
  }
  window.dispatchEvent(new CustomEvent(BAG_EVENT, { detail: bag }));
}

/*
 * The bag is read on mount rather than during render so the server and the first client render
 * agree on an empty bag; the stored bag arrives in the effect. Every surface that mutates the bag
 * publishes one event, so a drawer open in one part of the tree stays in step with the header count.
 */
export function useClientBag() {
  const [bag, setBag] = useState(emptyBag);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBag(loadBag());
    setHydrated(true);
    const handleChange = event => setBag(event.detail ? readBag(event.detail) : loadBag());
    window.addEventListener(BAG_EVENT, handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener(BAG_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const commit = useCallback(next => {
    setBag(next);
    persistBag(next);
    return next;
  }, []);

  return {
    bag,
    hydrated,
    add: useCallback(line => commit(addLine(loadBag(), line)), [commit]),
    remove: useCallback(key => commit(removeLine(loadBag(), key)), [commit]),
    setQuantity: useCallback((key, quantity) => commit(setQuantity(loadBag(), key, quantity)), [commit]),
    applyDiscount: useCallback((code, codes) => commit(applyDiscount(loadBag(), code, codes)), [commit]),
    clear: useCallback(() => commit(clearBag()), [commit]),
    lineKey: bagLineKey,
  };
}
