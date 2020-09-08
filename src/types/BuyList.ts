import { Batch } from './Batch';

export type BuyList = {
  batches: Batch[];
  totalBuyAt: number;
  totalSellAt: number;
  totalNetProfit: number;
};
