import { groupBy, orderBy } from 'lodash';

import { Order } from '@/types';

class OptimalBuyOrderFinder {
  findOptimalBuyOrders(
    orders: Order[],
    minResellProfit: number,
    budget: number,
    tax: number
  ) {
    const ordersByItem = groupBy(
      orderBy(orders, order => order.price),
      order => order.itemId
    );

    const optimalOrders = Object.values(ordersByItem)
      .filter(orders => orders.length > 1)
      .map(orders => ({
        itemId: orders[0].itemId,
        price: orders[0].price,
        resellProfit: orders[1].price - orders[0].price * (1 + tax / 100)
      }))
      .filter(
        order => order.resellProfit >= minResellProfit && order.price <= budget
      );

    return orderBy(optimalOrders, order => order.resellProfit, ['desc']);
  }
}

export const optimalBuyOrderFinder = new OptimalBuyOrderFinder();
