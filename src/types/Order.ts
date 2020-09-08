import { OrderType } from './esi';

export type Order = {
  itemId: number;
  quantity: number;
  minQuantity: number;
  price: number;
  type: OrderType;
};
