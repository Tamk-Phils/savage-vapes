'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedFlavor?: string) => void;
  removeItem: (productId: string, selectedFlavor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedFlavor?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING_FEE = 15;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vape_well_cart') || localStorage.getItem('savage_vapes_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('vape_well_cart', JSON.stringify(items));
      } catch (e) {
        console.warn('Could not save cart to localStorage', e);
      }
    }
  }, [items, isHydrated]);

  const addItem = (product: Product, quantity = 1, selectedFlavor?: string) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedFlavor === selectedFlavor
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      } else {
        return [...prev, { product, quantity, selectedFlavor }];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, selectedFlavor?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && i.selectedFlavor === selectedFlavor)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedFlavor?: string) => {
    if (quantity <= 0) {
      removeItem(productId, selectedFlavor);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id === productId && i.selectedFlavor === selectedFlavor) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const p = item.product.on_sale && item.product.sale_price ? item.product.sale_price : item.product.price;
    return sum + p * item.quantity;
  }, 0);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        shippingFee,
        total: Math.round(total * 100) / 100,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountUntilFreeShipping: Math.round(amountUntilFreeShipping * 100) / 100,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

