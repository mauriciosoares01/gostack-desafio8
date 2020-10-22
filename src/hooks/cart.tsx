import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const result = await AsyncStorage.getItem('@app:cart');

      if (result) {
        const productsJSON = JSON.parse(result);

        setProducts(productsJSON);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(item => item.id === product.id);

      let tempProducts = [];

      if (productIndex !== -1) {
        tempProducts = products;
        tempProducts[productIndex] = {
          ...tempProducts[productIndex],
          quantity: tempProducts[productIndex].quantity + 1,
        };

        setProducts([...tempProducts]);
      } else {
        const tempProduct = { ...product, quantity: 1 };

        tempProducts = [...products, tempProduct];
        setProducts(tempProducts);
      }

      const productsStringified = JSON.stringify(tempProducts);
      await AsyncStorage.setItem('@app:cart', productsStringified);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incremented = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(incremented);
      await AsyncStorage.setItem('@app:cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decremented = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      setProducts(decremented);
      await AsyncStorage.setItem('@app:cart', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
