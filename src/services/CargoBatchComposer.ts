import { groupBy, orderBy, mapValues, sumBy, omit } from 'lodash';
import { Order, Item, Batch, Dictionary } from '@/types';
import { BuyList } from '@/types/BuyList';
import { ILLEGAL_ITEMS } from '@/constants';

export class CargoBatchComposer {
  private batches: Batch[] = [];

  constructor(private tax: number, private items: Dictionary<Item>) {}

  private sortAndGroupOrders(
    orders: Order[],
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    const ordersByItem = omit(
      groupBy(orders, order => order.itemId),
      ILLEGAL_ITEMS
    );

    return mapValues(ordersByItem, itemOrders => {
      const ordersByPrice = groupBy(itemOrders, order => order.price);
      const combinedOrders = Object.values(ordersByPrice).map(orders => ({
        ...orders[0],
        quantity: sumBy(orders, order => order.quantity)
      }));

      return orderBy(combinedOrders, order => order.price, sortOrder);
    });
  }

  private getBatchBuyPriority = (batch: Batch) => {
    const profitPerCubicMetre =
      (this.excludeSalesTax(batch.sellAt) - batch.buyAt) / batch.item.volume;

    return profitPerCubicMetre;
  };

  composeBatches(buyOrders: Order[], sellOrders: Order[]) {
    const buyOrdersByItemId = this.sortAndGroupOrders(buyOrders);
    const sellOrdersByItemId = this.sortAndGroupOrders(sellOrders, 'desc');

    const buyItemIds = Object.keys(buyOrdersByItemId);

    this.batches = [];

    itemsLoop: for (const itemId of buyItemIds) {
      const item = this.items[itemId];
      const itemBuyOrders = buyOrdersByItemId[itemId];
      const itemSellOrders = sellOrdersByItemId[itemId];

      let nextSellOrderIndex = 0;
      ordersLoop: for (const buyOrder of itemBuyOrders) {
        if (itemSellOrders) {
          let bestSellOrder = itemSellOrders[nextSellOrderIndex];
          let sellQuantityLeft = bestSellOrder.quantity;
          let buyQuantityLeft = buyOrder.quantity;

          while (buyQuantityLeft > 0) {
            const profit = bestSellOrder.price - buyOrder.price;

            if (profit > 0) {
              const batchSize = Math.min(
                buyOrder.quantity,
                bestSellOrder.quantity
              );

              if (batchSize < bestSellOrder.minQuantity) {
                // Best buy order's quantity is not enough for selling to best sell order, moving to next sell order
                nextSellOrderIndex++;
                continue ordersLoop;
              }

              const netProfit =
                this.excludeSalesTax(bestSellOrder.price) - buyOrder.price;

              this.batches.push({
                id: this.batches.length,
                item,
                quantity: batchSize,
                buyAt: buyOrder.price,
                sellAt: bestSellOrder.price,
                netProfit
              });

              buyQuantityLeft -= batchSize;
              sellQuantityLeft -= batchSize;

              if (!sellQuantityLeft) {
                nextSellOrderIndex++;

                if (itemSellOrders.length > nextSellOrderIndex) {
                  bestSellOrder = itemSellOrders[nextSellOrderIndex];
                  sellQuantityLeft = bestSellOrder.quantity;
                } else {
                  // No sell orders left for this item, moving to the next one
                  continue itemsLoop;
                }
              }
            } else {
              // Lowest buy order is bigger than highest sell order, so no profit for this item, moving to next one
              continue itemsLoop;
            }
          }
        }
      }
    }

    // Most profitable batches (per cubic metre) should be consumed first
    this.batches = orderBy(this.batches, this.getBatchBuyPriority, ['desc']);
  }

  excludeSalesTax(amount: number) {
    return (amount * (100 - this.tax)) / 100;
  }

  getMostProfitableLoad(
    budget: number,
    cargoCapacity: number,
    roi: number,
    allowDuplicates: boolean
  ) {
    const buyLists: BuyList[] = [
      { batches: [], totalBuyAt: 0, totalSellAt: 0, totalNetProfit: 0 }
    ];

    let volumeLeft = cargoCapacity;
    let budgetLeft = budget;
    let totalBuyAt = 0;
    let totalSellAt = 0;
    let batchIndex = 0;

    const eps = 0.01;

    while (
      volumeLeft > eps &&
      budgetLeft > eps &&
      batchIndex < this.batches.length
    ) {
      const batch = this.batches[batchIndex];
      const affordedQuantityByVolume = Math.min(
        batch.quantity,
        Math.floor(volumeLeft / batch.item.volume)
      );
      const affordedQuantityByBudget = Math.min(
        batch.quantity,
        Math.floor(budgetLeft / batch.buyAt)
      );
      const affordedQuantity = Math.min(
        affordedQuantityByVolume,
        affordedQuantityByBudget
      );

      const batchBuyAt = batch.buyAt * affordedQuantity;
      const batchSellAt = this.excludeSalesTax(batch.sellAt * affordedQuantity);
      const batchNetProfit = batchSellAt - batchBuyAt;
      const batchRoi = (batchNetProfit * 100) / batchBuyAt;

      if (affordedQuantity > 0 && batchRoi >= roi) {
        const suitableBuyList = buyLists.find(buyList =>
          buyList.batches.every(
            listedBatch => listedBatch.item.id !== batch.item.id
          )
        );

        if (allowDuplicates || suitableBuyList) {
          totalBuyAt += batchBuyAt;
          totalSellAt += batchSellAt;
          volumeLeft -= batch.item.volume * affordedQuantity;
          budgetLeft -= batch.buyAt * affordedQuantity;
        }

        const newBatch = {
          ...batch,
          netProfit: batchNetProfit,
          id: batchIndex,
          quantity: affordedQuantity
        };

        if (suitableBuyList) {
          suitableBuyList.batches.push(newBatch);
          suitableBuyList.totalBuyAt += batchBuyAt;
          suitableBuyList.totalSellAt += batchSellAt;
          suitableBuyList.totalNetProfit += batchNetProfit;
        } else if (allowDuplicates) {
          buyLists.push({
            batches: [newBatch],
            totalBuyAt: batchBuyAt,
            totalSellAt: batchSellAt,
            totalNetProfit: batchNetProfit
          });
        }
      }

      batchIndex++;
    }

    return {
      buyLists,
      loadInfo: {
        volumeLeft: volumeLeft < eps ? 0 : volumeLeft,
        budgetLeft: budgetLeft < eps ? 0 : budgetLeft,
        totalBuyAt,
        totalSellAt,
        totalNetProfit: totalSellAt - totalBuyAt
      }
    };
  }

  applyBatchAdjustions(
    editedBatches: Dictionary<number>,
    removedBatches: number[]
  ) {
    Object.entries(editedBatches).forEach(([batchIndex, newQuantity]) => {
      this.batches[+batchIndex].quantity = newQuantity;
    });

    this.batches = this.batches.filter(
      (_, batchIndex) => !removedBatches.includes(batchIndex)
    );
  }
}
