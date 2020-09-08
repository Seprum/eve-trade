import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class';
import { NotifySettings } from '@/types';
import { notifications } from '@/services';

@Component
export default class NotifyDialog extends Vue {
  @State notifySettings: NotifySettings;
  @State isStaticDataLoaded: boolean;

  isOpened = false;
  isEnabled = false;
  interval = 0;
  minProfit = 0;

  @Mutation setNotifySettings: (settings: NotifySettings) => void;

  @Watch('isStaticDataLoaded')
  onStaticDataLoadedStateChange(loaded: boolean) {
    if (loaded) {
      notifications.setProfitNotificationSettings(this.notifySettings);
    }
  }

  created() {
    this.reset();
  }

  setInterval(value: number) {
    this.interval = value;
  }

  setMinProfit(value: number) {
    this.minProfit = value;
  }

  reset() {
    this.isEnabled = this.notifySettings.isEnabled;
    this.interval = this.notifySettings.interval;
    this.minProfit = this.notifySettings.minProfit;
  }

  save() {
    const { isEnabled, interval, minProfit } = this;
    const settings = { isEnabled, interval, minProfit };

    this.setNotifySettings(settings);
    notifications.setProfitNotificationSettings(settings);

    this.isOpened = false;
  }

  close() {
    this.isOpened = false;
    this.reset();
  }
}
