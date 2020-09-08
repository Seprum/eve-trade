import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import numeral from 'numeral';
import { debounce } from 'lodash';

import { marketDataSource, CargoBatchComposer } from '@/services';
import { OrderType } from '@/types/esi';
import { Station, Batch, Item, Dictionary, LoadInfo, BuyList } from '@/types';
import { quantity, currency, volume } from '@/helpers/formatters';
import { copyToClipboard } from '@/helpers/copyToClipboard';
import Amount from '@/components/Amount.vue';
import { DEFAULT_ROI_PERCENTAGE } from '@/constants';

@Component({
  methods: { quantity, currency, volume },
  components: { Amount }
})
export default class TradeLists extends Vue {
  dataLoaded = false;
  headers = [
    { text: 'Item', value: 'item.name' },
    { text: 'Quantity', value: 'quantity' },
    { text: 'Buy At', value: 'buyAt' },
    { text: 'Sell At', value: 'sellAt' },
    { text: 'Net Profit', value: 'netProfit' },
    { text: 'Efficiency', value: 'efficiency' },
    { value: 'actions', sortable: false, align: 'end' }
  ];
  roi = DEFAULT_ROI_PERCENTAGE;
  buyLists: BuyList[] = [];
  activeBuyList: BuyList = null;
  activePage = 1;
  snackText = '';
  snackbar = false;

  loadInfo: LoadInfo;
  cargoBatchComposer: CargoBatchComposer;
  isAllInEnabled = true;

  editedBatches: Dictionary<number>;
  removedBatches: number[];

  @State fromStation: Station;
  @State toStation: Station;
  @State getItems: () => Dictionary<Item>;
  @State budget: number;
  @State cargoCapacity: number;
  @State tax: number;
  @Mutation swapStations: () => void;

  @Watch('fromStation')
  onStationChange() {
    this.dataLoaded = false;
    this.loadData();
  }

  @Watch('roi')
  onReturnOnInvestmentChange = debounce(
    () => this.getMostProfitableLoad(),
    300
  );

  get page() {
    return this.activePage;
  }

  set page(value: number) {
    this.activePage = value;
    this.activeBuyList = this.buyLists[value - 1];
  }

  get allIn() {
    return this.isAllInEnabled;
  }

  set allIn(value) {
    this.isAllInEnabled = value;
    this.cargoBatchComposer.setAllIn(value);
    this.getMostProfitableLoad();
  }

  async created() {
    const items = this.getItems();

    this.cargoBatchComposer = new CargoBatchComposer(
      this.tax,
      this.allIn,
      items
    );

    await this.loadData();
  }

  async loadData() {
    // We are buying from sell orders and selling to buy orders
    const buyOrders = await marketDataSource.getStationOrders(
      this.fromStation.regionId,
      this.fromStation.id,
      OrderType.Sell
    );

    const sellOrders = await marketDataSource.getStationOrders(
      this.toStation.regionId,
      this.toStation.id,
      OrderType.Buy
    );

    this.cargoBatchComposer.composeBatches(buyOrders, sellOrders);

    this.getMostProfitableLoad();
    this.dataLoaded = true;
  }

  getMostProfitableLoad() {
    const {
      buyLists,
      loadInfo
    } = this.cargoBatchComposer.getMostProfitableLoad(
      this.budget,
      this.cargoCapacity,
      this.tax,
      this.roi
    );

    this.buyLists = buyLists;

    if (buyLists.length) {
      this.loadInfo = loadInfo;
      this.resetBatchChanges();

      const activeBuyList = buyLists[0];

      this.activeBuyList = activeBuyList;
      this.activePage = 1;
    }
  }

  copyActiveBuyList() {
    const buyListText = this.activeBuyList.batches
      .map(batch => `${batch.item.name} x${batch.quantity}`)
      .join('\n');

    copyToClipboard(buyListText);

    this.snackText = 'Buy list copied to clipboard';
    this.snackbar = true;
  }

  resetBatchChanges() {
    this.editedBatches = {};
    this.removedBatches = [];
  }

  removeBatch(batch: Batch) {
    const batchIndex = this.activeBuyList!.batches.indexOf(batch);

    this.activeBuyList!.batches.splice(batchIndex, 1);
    this.removedBatches.push(batch.id);

    this.updateInfo(batch);
  }

  changeQuantity(batch: Batch, quantity: number) {
    const newQuantity = numeral(quantity).value();

    batch.quantity = newQuantity;
    this.editedBatches[batch.id] = newQuantity;

    this.updateInfo(batch);
  }

  updateInfo(batch: Batch) {
    const batchBuyAt = batch.buyAt * batch.quantity;
    const batchSellAt = batch.sellAt * batch.quantity;
    const batchNetProfit = (batchSellAt * (100 - this.tax)) / 100 - batchBuyAt;
    const batchVolume = batch.item.volume * batch.quantity;

    this.activeBuyList.totalBuyAt -= batchBuyAt;
    this.activeBuyList.totalSellAt -= batchSellAt;
    this.activeBuyList.totalNetProfit -= batchNetProfit;

    this.loadInfo.totalBuyAt -= batchBuyAt;
    this.loadInfo.totalSellAt -= batchSellAt;
    this.loadInfo.totalNetProfit -= batchNetProfit;
    this.loadInfo.volumeLeft += batchVolume;
    this.loadInfo.budgetLeft += batchBuyAt;
  }

  refit() {
    this.cargoBatchComposer.applyBatchAdjustions(
      this.editedBatches,
      this.removedBatches
    );
    this.getMostProfitableLoad();
  }

  async syncBuyList() {
    const buyListText = await navigator.clipboard.readText();
    const itemPrices = buyListText
      .split('\n')
      .map(line => line.split('\t'))
      .map(([name, quantity, buyAt]) => ({
        name,
        quantity: +quantity,
        buyAt: numeral(buyAt).value()
      }))
      .reduce<Dictionary<number>>(
        (result, item) => ({ ...result, [item.name]: item.buyAt }),
        {}
      );

    const unavailableBatches = this.activeBuyList.batches.filter(
      batch => batch.buyAt < itemPrices[batch.item.name]
    );

    unavailableBatches.forEach(this.removeBatch);
  }
}
