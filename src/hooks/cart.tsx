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

interface AddProduct {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity?: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: AddProduct): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1234',
      title: 'Test product',
      image_url: 'test',
      price: 1000,
      quantity: 0,
    },
  ]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storage = await AsyncStorage.getItem('@items');
      const items = storage ? JSON.parse(storage) : [];
      if (items.length) setProducts(items);
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const selected_index = products.findIndex(product => product.id === id);
      const temp_products = products;
      if (temp_products[selected_index]) {
        temp_products[selected_index].quantity += 1;
      } else temp_products[selected_index].quantity = 1;
      setProducts([...temp_products]);
      AsyncStorage.setItem('@items', JSON.stringify([...temp_products]));
    },
    [setProducts, products],
  );

  const addToCart = useCallback(
    async product => {
      const product_find = products.find(item => product.id === item.id);
      if (product_find) {
        increment(product_find.id);
      } else {
        setProducts([
          ...products,
          {
            ...product,
            quantity:
              typeof product.quantity === 'number' ? product.quantity : 1,
          },
        ]);
        AsyncStorage.setItem(
          '@items',
          JSON.stringify([
            ...products,
            {
              ...product,
              quantity:
                typeof product.quantity === 'number' ? product.quantity : 1,
            },
          ]),
        );
      }
    },
    [setProducts, products, increment],
  );

  const decrement = useCallback(
    async id => {
      const selected_index = products.findIndex(product => product.id === id);
      const temp_products = products;
      if (temp_products[selected_index].quantity > 1)
        temp_products[selected_index].quantity -= 1;
      else temp_products.splice(selected_index, 1);

      setProducts([...temp_products]);
      AsyncStorage.setItem('@items', JSON.stringify([...temp_products]));
    },
    [setProducts, products],
  );

  const value = { addToCart, increment, decrement, products };

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
