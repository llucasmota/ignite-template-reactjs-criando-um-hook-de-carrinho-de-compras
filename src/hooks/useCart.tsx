import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}


const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartDraft = [...cart];
      const productExists = cartDraft.find(p => p.id === productId)


      if (!productExists) {
        const verifyRemoteStock = await api.get<Stock>(`/stock/${productId}`)
        console.log('estoque', verifyRemoteStock.data.amount > 0)
        if (verifyRemoteStock.data.amount > 0) {
          const { data } = await api.get<Product>(`/products/${productId}`)
          cartDraft.push({ ...data, amount: 1 })

          setCart(cartDraft)
          localStorage.removeItem('@RocketShoes:cart')
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartDraft))
        }
        else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } else {
        return await updateProductAmount({ productId, amount: productExists.amount + 1 })
      }


    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find(p => p.id === productId)
      if (!productExists) {
        toast.error('Erro na remoção do produto');
      } else {
        const newCart = cart.filter(p => p.id !== productId)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        setCart(newCart)
      }
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    if (amount <= 0) return

    try {
      // TODO
      const draftCart = [...cart]
      const verifyQuantityInCart = draftCart.find(p => p.id === productId)

      const verifyRemoteStock = await api.get<Stock>(`/stock/${productId}`)

      let availableStock: boolean = false

      if (verifyQuantityInCart) {

        // let calculateVirtalStock = verifyRemoteStock.data.amount - verifyQuantityInCart.amount + amount
        availableStock = amount > verifyRemoteStock.data.amount ? false : true

      }
      if (availableStock) {

        const element = draftCart.findIndex(p => p.id === productId)
        if (element !== -1) {
          draftCart[element].amount = amount
          localStorage.removeItem('@RocketShoes:cart')
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(draftCart))
        }
      } else {
        toast.error('Quantidade solicitada fora de estoque');
      }

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
