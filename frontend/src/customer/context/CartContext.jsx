import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("pizzahub_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("pizzahub_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, size = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: size ? product.sizes?.[size] || product.price : product.price,
          image: product.image,
          size,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (itemId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === itemId && item.size === size))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Compute total as direct value for components that need it
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    cartTotal, // Direct value for easy access
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
