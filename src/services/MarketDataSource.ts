import { range, flatten } from 'lodash';
import api from '@/api';
import { OrderType } from '@/types/esi';
import { Order } from '@/types';

class MarketDataSource {
  async getStationOrders(
    regionId: number,
    stationId: number,
    orderType: OrderType
  ) {
    const pagesCount = await api.getMarketOrderPagesCount(regionId, orderType);
    const orderPromises = range(pagesCount).map(async pageIndex => {
      const orders = await api.getMarketOrders(
        regionId,
        orderType,
        pageIndex + 1
      );

      return orders
        .filter(order => order.location_id === stationId)
        .map<Order>(order => ({
          itemId: order.type_id,
          quantity: order.volume_remain,
          minQuantity: order.min_volume,
          price: order.price
        }));
    });

    const orders = await Promise.all(orderPromises);

    return flatten(orders);
  }
}

export const marketDataSource = new MarketDataSource();
