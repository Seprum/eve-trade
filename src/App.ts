import Vue from 'vue';
import Component from 'vue-class-component';
import { State, Action } from 'vuex-class';

import { routes } from '@/router';
import NotifyDialog from '@/components/NotifyDialog';

@Component({ name: 'eve-trade', components: { NotifyDialog } })
export default class App extends Vue {
  routes = routes;

  @State isStaticDataLoaded: boolean;

  @Action loadStaticData: () => void;

  created() {
    if (!this.isStaticDataLoaded) {
      this.loadStaticData();
    }
  }
}
