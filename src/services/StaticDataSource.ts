import api from '@/api';
import { Station, Item, Dictionary } from '@/types';
import { Region } from '@/types/esi';

type StatusChangeHandler = (status: string) => void;

class StaticDataSource {
  public onStatusChange: StatusChangeHandler;

  public async getStationsData() {
    this.onStatusChange('Loading regions...');

    const regions: Region[] = [];
    const regionIds = await api.getRegionIds();

    for (let index = 0; index < regionIds.length; index++) {
      this.onStatusChange(
        `Loading regions (${index + 1}/${regionIds.length})...`
      );

      const regionDetails = await api.getRegionDetails(regionIds[index]);

      regions.push(regionDetails);
    }

    this.onStatusChange('Loading solar systems...');

    const constellations: { [constellationId: string]: number[] } = {};
    const stations: Station[] = [];
    const systemIds = await api.getSystemIds();

    for (let index = 0; index < systemIds.length; index++) {
      this.onStatusChange(
        `Loading solar systems (${index + 1}/${systemIds.length})...`
      );

      const systemDetails = await api.getSystemDetails(systemIds[index]);

      if (systemDetails.stations) {
        const constellation = constellations[systemDetails.constellation_id];

        if (constellation) {
          constellations[systemDetails.constellation_id].push(
            ...systemDetails.stations
          );
        } else {
          constellations[systemDetails.constellation_id] =
            systemDetails.stations;
        }
      }
    }

    const constellationIds = Object.keys(constellations);
    const stationsCount = constellationIds.reduce(
      (count, constellationId) =>
        count + constellations[constellationId].length,
      0
    );

    let index = 0;
    for (const constellationId of constellationIds) {
      const stationIds = constellations[constellationId];

      for (const stationId of stationIds) {
        this.onStatusChange(
          `Loading stations (${++index}/${stationsCount})...`
        );

        const stationDetails = await api.getStationDetails(stationId);

        stations.push({
          id: stationDetails.station_id,
          name: stationDetails.name,
          regionId: regions.find(region =>
            region.constellations.includes(+constellationId)
          )!.region_id
        });
      }
    }

    return stations;
  }

  public async getItemsData() {
    this.onStatusChange('Loading items...');

    const pagesCount = await api.getItemPagesCount();
    const allItemIds: number[] = [];

    for (let page = 1; page <= pagesCount; page++) {
      const itemIds = await api.getItemIds(page);

      allItemIds.push(...itemIds);
    }

    const items: Dictionary<Item> = {};

    for (let index = 0; index < allItemIds.length; index++) {
      this.onStatusChange(
        `Loading items (${index + 1}/${allItemIds.length})...`
      );

      const itemDetails = await api.getItemDetails(allItemIds[index]);

      items[itemDetails.type_id] = {
        id: itemDetails.type_id,
        name: itemDetails.name,
        volume: itemDetails.volume
      };
    }

    return items;
  }
}

export const staticDataSource = new StaticDataSource();
