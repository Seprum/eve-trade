import Vue from 'vue';
import Component from 'vue-class-component';
import { State, Getter, Action, Mutation } from 'vuex-class';

import { currency, volume } from '@/helpers/formatters';
import { taxOptions } from '@/staticData';
import { Station } from '@/types';

@Component({ data: () => ({ taxOptions }), methods: { currency, volume } })
export default class SetupView extends Vue {
  @Getter stations: Station[];
  @Getter fromStationId: number;
  @Getter toStationId: number;

  @State loadingStatus: string;
  @State budget: number;
  @State cargoCapacity: number;
  @State(state => taxOptions.find(option => option.value === state.tax))
  selectedTaxOption: typeof taxOptions[number];

  @Mutation setFromStation: (stationId: number) => void;
  @Mutation setToStation: (stationId: number) => void;
  @Mutation swapStations: () => void;
  @Mutation setBudget: (budget: number) => void;
  @Mutation setCargoCapacity: (cargoCapacity: number) => void;
  @Mutation setTax: (tax: number) => void;

  @Action refreshStaticData: () => void;

  get fromStations() {
    return this.stations.filter(station => station.id !== this.toStationId);
  }

  get toStations() {
    return this.stations.filter(station => station.id !== this.fromStationId);
  }

  validateKeys(event: KeyboardEvent) {
    if (['Comma', 'Period', 'KeyE', 'Minus'].includes(event.code)) {
      event.preventDefault();
    }
  }
}
