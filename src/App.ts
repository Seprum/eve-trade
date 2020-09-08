import Vue from 'vue';
import Component from 'vue-class-component';
import { State, Action } from 'vuex-class';

@Component({ name: 'eve-trade' })
export default class App extends Vue {
  @State isStaticDataLoaded: boolean;
  @Action loadStaticData: () => void;

  created() {
    this.loadStaticData();
  }
}
