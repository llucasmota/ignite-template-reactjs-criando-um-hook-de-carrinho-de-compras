import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const newSum = { ...sumAmount }
    newSum[product.id] = product.amount
    return newSum
  }, {} as CartItemsAmount)

  console.log(cartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      // TODO
      const { data } = await api.get<Product[]>('/products')
      const dataFormmatted: ProductFormatted[] = data.map(p => {
        return { ...p, priceFormatted: formatPrice(p.price) }
      })
      setProducts(dataFormmatted)

    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    await addProduct(id)
  }

  return (
    <ProductList>
      {products.length && products.map((product) => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0} 2
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}

    </ProductList>
  );
};

export default Home;
