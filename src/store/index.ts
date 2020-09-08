import Vue from 'vue';
import Vuex from 'vuex';

import { Station, Item, Dictionary, NotifySettings } from '@/types';
import { staticDataSource, staticDataStore } from '@/services';
import { mapTradeHubsToStations } from '@/helpers/mapTradeHubsToStations';
import {
  DEFAULT_BUDGET,
  DEFAULT_CARGO_CAPACITY,
  DEFAULT_TAX,
  DEFAULT_PROFIT_CHECK_INTERVAL,
  DEFAULT_PROFIT_CHECK_MIN_VALUE
} from '@/constants';

Vue.use(Vuex);

export type State = {
  loadingStatus: string;
  isStaticDataLoaded: boolean;
  stations: Station[];
  tradeHubs: Station[];
  getItems: () => Dictionary<Item>;
  fromStation: Station | null;
  toStation: Station | null;
  budget: number;
  cargoCapacity: number;
  tax: number;
  notifySettings: NotifySettings;
};

const getInitialState = (): State => {
  const budget = +localStorage.getItem('budget')! || DEFAULT_BUDGET;
  const cargoCapacity =
    +localStorage.getItem('cargoCapacity')! || DEFAULT_CARGO_CAPACITY;
  const tax = +localStorage.getItem('tax')! || DEFAULT_TAX;
  const notifySettings: NotifySettings = JSON.parse(
    localStorage.getItem('notifySettings')
  ) || {
    isEnabled: false,
    interval: DEFAULT_PROFIT_CHECK_INTERVAL,
    minProfit: DEFAULT_PROFIT_CHECK_MIN_VALUE
  };
  const stations: Station[] = JSON.parse(localStorage.getItem('eveStations'));
  const items: Dictionary<Item> = JSON.parse(localStorage.getItem('eveItems'));
  const isStaticDataLoaded = !!stations && !!items;

  const fromStationId = localStorage.getItem('fromStationId');
  const toStationId = localStorage.getItem('toStationId');

  return {
    loadingStatus: isStaticDataLoaded ? 'Stations & items data loaded' : '',
    isStaticDataLoaded,
    stations: stations || [],
    tradeHubs: stations ? mapTradeHubsToStations(stations) : [],
    getItems: items ? () => items : () => ({}),
    fromStation:
      stations && fromStationId
        ? stations.find(station => station.id === +fromStationId)
        : null,
    toStation:
      stations && toStationId
        ? stations.find(station => station.id === +toStationId)
        : null,
    budget,
    cargoCapacity,
    tax,
    notifySettings
  };
};

export default new Vuex.Store<State>({
  strict: process.env.NODE_ENV !== 'production',
  state: getInitialState(),
  getters: {
    stations: state => [...state.tradeHubs, ...state.stations],
    fromStationId: state => state.fromStation?.id,
    toStationId: state => state.toStation?.id
  },
  mutations: {
    setLoadingStatus(state, status: string) {
      state.loadingStatus = status;
    },
    setStations(state, stations: Station[]) {
      state.stations = stations;
      state.tradeHubs = mapTradeHubsToStations(stations);
    },
    setItems(state, items: Dictionary<Item>) {
      state.getItems = () => items;
    },
    setStaticDataLoaded(state) {
      state.isStaticDataLoaded = true;
    },
    setBudget(state, budget: number) {
      state.budget = budget;
      localStorage.setItem('budget', budget.toString());
    },
    setCargoCapacity(state, cargoCapacity: number) {
      state.cargoCapacity = cargoCapacity;
      localStorage.setItem('cargoCapacity', cargoCapacity.toString());
    },
    setTax(state, tax: number) {
      state.tax = tax;
      localStorage.setItem('tax', tax.toString());
    },
    setFromStation(state, stationId?: number) {
      if (!stationId) {
        localStorage.removeItem('fromStationId');
      } else {
        const station = state.stations.find(
          station => station.id === stationId
        )!;

        state.fromStation = station;
        localStorage.setItem('fromStationId', stationId.toString());
      }
    },
    setToStation(state, stationId?: number) {
      if (!stationId) {
        localStorage.removeItem('toStationId');
      } else {
        const station = state.stations.find(
          station => station.id === stationId
        )!;

        state.toStation = station;
        localStorage.setItem('toStationId', stationId.toString());
      }
    },
    swapStations(state) {
      const lastFromStation = state.fromStation;

      state.fromStation = state.toStation;
      state.toStation = lastFromStation;
      localStorage.setItem('fromStationId', state.fromStation!.id.toString());
      localStorage.setItem('toStationId', state.toStation!.id.toString());
    },
    setNotifySettings(state, settings) {
      state.notifySettings = settings;
      localStorage.setItem('notifySettings', JSON.stringify(settings));
    }
  },
  actions: {
    async loadStaticData({ commit }) {
      staticDataSource.onStatusChange = status =>
        commit('setLoadingStatus', status);

      let stations = await staticDataStore.loadStations();

      if (!stations) {
        stations = await staticDataSource.getStationsData();

        commit('setLoadingStatus', 'Saving stations...');
        await staticDataStore.saveStations(stations);
      }

      commit('setStations', stations);

      const fromStationId = +localStorage.getItem('fromStationId')!;
      const toStationId = +localStorage.getItem('toStationId')!;

      if (fromStationId) {
        commit('setFromStation', fromStationId);
      }
      if (toStationId) {
        commit('setToStation', toStationId);
      }

      let items = await staticDataStore.loadItems();

      if (!items) {
        items = await staticDataSource.getItemsData();
        commit('setLoadingStatus', 'Saving items...');
        await staticDataStore.saveItems(items);
      }

      commit('setItems', items);
      commit('setStaticDataLoaded');
      commit('setLoadingStatus', 'Stations & items data loaded');
    },
    async refreshStaticData({ commit }) {
      staticDataSource.onStatusChange = status =>
        commit('setLoadingStatus', status);

      const stations = await staticDataSource.getStationsData();

      commit('setStations', stations);
      commit('setLoadingStatus', 'Saving stations...');
      await staticDataStore.saveStations(stations);

      const items = await staticDataSource.getItemsData();

      commit('setLoadingStatus', 'Saving items...');
      await staticDataStore.saveItems(items);

      commit('setLoadingStatus', 'Stations & items data loaded');
    }
  }
});
