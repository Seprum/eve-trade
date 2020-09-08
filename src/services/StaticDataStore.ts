// import storage from 'electron-json-storage';
import { Station, Item, Dictionary } from '@/types';

const ITEMS_STORE_KEY = 'eveItems';
const STATIONS_STORE_KEY = 'eveStations';

class StaticDataStore {
  private load<T extends object>(storeKey: string) {
    // return new Promise<T | null>((resolve, reject) =>
    //   storage.get(storeKey, (err, data) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(Object.keys(data).length ? (data as T) : null);
    //     }
    //   })
    // );
    return JSON.parse(localStorage.getItem(storeKey) || 'null');
  }

  private save<T extends object>(storeKey: string, data: T) {
    // return new Promise((resolve, reject) =>
    //   storage.set(storeKey, data, (err) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve();
    //     }
    //   })
    // );
    localStorage.setItem(storeKey, JSON.stringify(data));
  }

  public loadStations() {
    return this.load<Station[]>(STATIONS_STORE_KEY);
  }

  public saveStations(stations: Station[]) {
    return this.save(STATIONS_STORE_KEY, stations);
  }

  public loadItems() {
    return this.load<Dictionary<Item>>(ITEMS_STORE_KEY);
  }

  public saveItems(items: Dictionary<Item>) {
    return this.save(ITEMS_STORE_KEY, items);
  }
}

export const staticDataStore = new StaticDataStore();
