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
      const tempProducts = products;
      const productIndex = products.findIndex(item => item.id === id);

      tempProducts[productIndex] = {
        ...tempProducts[productIndex],
        quantity: tempProducts[productIndex].quantity + 1,
      };

      const productsStringified = JSON.stringify(tempProducts);
      await AsyncStorage.setItem('@app:cart', productsStringified);

      setProducts([...tempProducts]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const tempProducts = products;
      const productIndex = products.findIndex(item => item.id === id);

      if (tempProducts[productIndex].quantity === 1) return;

      tempProducts[productIndex] = {
        ...tempProducts[productIndex],
        quantity: tempProducts[productIndex].quantity - 1,
      };

      const productsStringified = JSON.stringify(tempProducts);
      await AsyncStorage.setItem('@app:cart', productsStringified);

      setProducts([...tempProducts]);
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
