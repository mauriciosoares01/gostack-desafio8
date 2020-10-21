import React, { useMemo } from 'react';

import { useNavigation } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  Container,
  CartPricing,
  CartButton,
  CartButtonText,
  CartTotalPrice,
} from './styles';

import formatValue from '../../utils/formatValue';

import { useCart } from '../../hooks/cart';

// Calculo do total
// Navegação no clique do TouchableHighlight

const FloatingCart: React.FC = () => {
  const { products } = useCart();

  const navigation = useNavigation();

  const cartTotal = useMemo(() => {
    const prices = products.map(item => item.price * item.quantity);

    let total = 0;

    if (prices.length) {
      total = prices.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
      );
    }

    return formatValue(total);
  }, [products]);

  const totalItensInCart = useMemo(() => {
    let totalOfItems = 0;

    if (products.length) {
      const quantitiesArray = products.map(item => item.quantity);
      totalOfItems = quantitiesArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
      );
    }
    return totalOfItems;
  }, [products]);

  return (
    <Container>
      <CartButton
        testID="navigate-to-cart-button"
        onPress={() => navigation.navigate('Cart')}
      >
        <FeatherIcon name="shopping-cart" size={24} color="#fff" />
        <CartButtonText>{`${totalItensInCart} itens`}</CartButtonText>
      </CartButton>

      <CartPricing>
        <CartTotalPrice>{cartTotal}</CartTotalPrice>
      </CartPricing>
    </Container>
  );
};

export default FloatingCart;
