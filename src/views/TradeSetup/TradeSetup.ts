import Vue from 'vue';
import Component from 'vue-class-component';
import { State, Getter, Action, Mutation } from 'vuex-class';
import { Station } from '@/types';
import { taxOptions } from '@/staticData';

@Component
export default class TradeSetup extends Vue {
  taxOptions = taxOptions;
  @Getter stations: Station[];
  @Getter fromStationId: number;
  @Getter toStationId: number;
  @State loadingStatus: string;
  @State budget: number;
  @State cargoCapacity: number;
  @State(state => taxOptions.find(option => option.value === state.tax))
  selectedTaxOption: typeof taxOptions[number];
  @Action
  refreshStaticData: () => void;
  @Mutation setFromStation: (stationId: number) => void;
  @Mutation setToStation: (stationId: number) => void;
  @Mutation swapStations: () => void;
  @Mutation setBudget: (budget: number) => void;
  @Mutation setCargoCapacity: (cargoCapacity: number) => void;
  @Mutation setTax: (tax: number) => void;
}
