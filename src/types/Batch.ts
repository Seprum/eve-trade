import { Item } from './Item';

export type Batch = {
  id: number;
  item: Item;
  quantity: number;
  buyAt: number;
  sellAt: number;
  netProfit: number;
  efficiency: number;
};
