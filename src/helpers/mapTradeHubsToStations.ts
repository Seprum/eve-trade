import { Station } from '@/types';
import { tradeHubs } from '@/staticData';

export const mapTradeHubsToStations = (stations: Station[]) =>
  tradeHubs.map(tradeHub => ({
    ...stations.find(station => station.name === tradeHub.stationName)!,
    name: tradeHub.title
  }));
