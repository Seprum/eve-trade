import { NotifySettings } from '@/types';
import { marketDataSource, CargoBatchComposer } from '.';
import store from '@/store';
import { OrderType } from '@/types/esi';
import { DEFAULT_ROI_PERCENTAGE } from '@/constants';
import { currency } from '@/helpers/formatters';
import { wait } from '@/helpers/wait';

function getSolarSystemName(stationName: string) {
  return stationName.split(' ')[0];
}

class NotificationsService {
  private profitNotificationSettings: NotifySettings;
  private lastNotifiedProfit: number;
  private lastNotification: Notification;

  setProfitNotificationSettings(settings: NotifySettings) {
    const wasDisabled =
      !this.profitNotificationSettings ||
      !this.profitNotificationSettings.isEnabled;

    this.profitNotificationSettings = settings;
    this.lastNotifiedProfit = null;

    if (settings.isEnabled && wasDisabled) {
      this.initiateProfitNotifications();
    }
  }

  private initiateProfitNotifications() {
    const items = store.state.getItems();

    const checkProfit = async () => {
      if (!this.profitNotificationSettings.isEnabled) {
        return;
      }

      const {
        fromStation,
        toStation,
        budget,
        cargoCapacity,
        tax
      } = store.state;

      const buyOrders = await marketDataSource.getStationOrders(
        fromStation.regionId,
        fromStation.id,
        OrderType.Sell
      );

      const sellOrders = await marketDataSource.getStationOrders(
        toStation.regionId,
        toStation.id,
        OrderType.Buy
      );

      const cargoBatchComposer = new CargoBatchComposer(tax, items);

      cargoBatchComposer.composeBatches(buyOrders, sellOrders);

      const {
        loadInfo: { totalNetProfit }
      } = cargoBatchComposer.getMostProfitableLoad(
        budget,
        cargoCapacity,
        DEFAULT_ROI_PERCENTAGE,
        false
      );

      if (
        totalNetProfit >= this.profitNotificationSettings.minProfit &&
        totalNetProfit != this.lastNotifiedProfit
      ) {
        this.lastNotifiedProfit = totalNetProfit;

        const fromSystem = getSolarSystemName(fromStation.name);
        const toSystem = getSolarSystemName(toStation.name);

        await this.notify(
          'Possible net profit',
          `${fromSystem} -> ${toSystem}: ${currency(totalNetProfit)} ISK`
        );
      }

      await wait(this.profitNotificationSettings.interval * 1000);
      checkProfit();
    };

    checkProfit();
  }

  private async notify(title: string, content: string) {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    if (this.lastNotification) {
      this.lastNotification.close();
    }

    this.lastNotification = new Notification(title, {
      body: content,
      requireInteraction: true
    });
  }
}

export const notifications = new NotificationsService();
