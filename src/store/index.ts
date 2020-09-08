import Vue from 'vue';
import Vuex from 'vuex';
import numeral from 'numeral';

import { Station, Item, Dictionary } from '@/types';
import { staticDataSource, staticDataStore } from '@/services';
import { mapTradeHubsToStations } from '@/helpers/mapTradeHubsToStations';

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
};

export default new Vuex.Store<State>({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    loadingStatus: '',
    isStaticDataLoaded: false,
    stations: [],
    tradeHubs: [],
    getItems: () => ({}),
    fromStation: null,
    toStation: null,
    budget: +localStorage.getItem('budget')! || 100000000,
    cargoCapacity: +localStorage.getItem('cargoCapacity')! || 500,
    tax: +localStorage.getItem('tax')! || 5
  },
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
    setBudget(state, budget: string) {
      const budgetValue = numeral(budget).value();

      state.budget = budgetValue;
      localStorage.setItem('budget', budgetValue.toString());
    },
    setCargoCapacity(state, cargoCapacity: string) {
      const cargoCapacityValue = numeral(cargoCapacity).value();

      state.cargoCapacity = cargoCapacityValue;
      localStorage.setItem('cargoCapacity', cargoCapacityValue.toString());
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

      let items = staticDataStore.loadItems();

      if (!items) {
        items = await staticDataSource.getItemsData();
        commit('setLoadingStatus', 'Saving items...');
        staticDataStore.saveItems(items);
      }

      commit('setItems', items);
      commit('setStaticDataLoaded');
      commit('setLoadingStatus', 'Stations & items data loaded');
    },
    async refreshStaticData({ commit }) {
      const stations = await staticDataSource.getStationsData();

      commit('setStations', stations);
      commit('setLoadingStatus', 'Saving stations...');
      staticDataStore.saveStations(stations);

      const items = await staticDataSource.getItemsData();

      commit('setLoadingStatus', 'Saving items...');
      staticDataStore.saveItems(items);

      commit('setLoadingStatus', 'Stations & items data loaded');
    }
  }
});
