import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({
        items: [...items, { ...product, quantity: 1, cartId: Date.now() }]
      });
    }
  },

  removeItem: (cartId) => {
    set({
      items: get().items.filter(item => item.cartId !== cartId)
    });
  },

  updateQuantity: (cartId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartId);
      return;
    }

    set({
      items: get().items.map(item =>
        item.cartId === cartId
          ? { ...item, quantity }
          : item
      )
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  toggleCart: () => {
    set({ isOpen: !get().isOpen });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }
}));