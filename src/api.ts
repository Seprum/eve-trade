/* eslint-disable @typescript-eslint/camelcase */

import axios, { AxiosResponse } from 'axios';
import { Region, System, Station, Type, Order, OrderType } from '@/types/esi';

const esi = axios.create({
  baseURL: 'https://esi.evetech.net/latest/',
  params: { datasource: 'tranquility' }
});

const withRetryOnFailure = async <T>(
  request: () => Promise<AxiosResponse<T>>,
  resultSelector = (response: AxiosResponse<T>) => response.data
): Promise<T> => {
  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    try {
      const response = await request();

      return resultSelector(response);
    } catch (err) {
      console.log(err);
    }
  }
};

export default {
  getRegionIds: () =>
    withRetryOnFailure(() => esi.get<number[]>('/universe/regions')),
  getRegionDetails: (regionId: number) =>
    withRetryOnFailure(() => esi.get<Region>(`/universe/regions/${regionId}`)),
  getSystemIds: () =>
    withRetryOnFailure(() => esi.get<number[]>('/universe/systems')),
  getSystemDetails: (systemId: number) =>
    withRetryOnFailure(() => esi.get<System>(`/universe/systems/${systemId}`)),
  getStationDetails: (stationId: number) =>
    withRetryOnFailure(() =>
      esi.get<Station>(`/universe/stations/${stationId}`)
    ),
  getItemPagesCount: () =>
    withRetryOnFailure<number>(
      () => esi.head(`/universe/types`),
      response => response.headers['x-pages']
    ),
  getItemIds: (page: number) =>
    withRetryOnFailure(() =>
      esi.get<number[]>('/universe/types', { params: { page } })
    ),
  getItemDetails: (itemId: number) =>
    withRetryOnFailure(() => esi.get<Type>(`/universe/types/${itemId}`)),
  getMarketOrders: (
    regionId: number,
    orderType: OrderType,
    page: number,
    itemId?: number
  ) =>
    withRetryOnFailure(() =>
      esi.get<Order[]>(`/markets/${regionId}/orders`, {
        params: {
          order_type: orderType,
          page,
          ...(itemId ? { type_id: itemId } : {})
        }
      })
    ),
  getMarketOrderPagesCount: (
    regionId: number,
    orderType: OrderType,
    itemId?: number
  ) =>
    withRetryOnFailure<number>(
      () =>
        esi.head(`/markets/${regionId}/orders`, {
          params: {
            order_type: orderType,
            ...(itemId ? { type_id: itemId } : {})
          }
        }),
      response => response.headers['x-pages']
    )
};
