<style lang="scss" src="./ResultsView.scss" scoped></style>
<script lang="ts" src="./ResultsView.ts"></script>

<template>
  <v-container
    style="height: 0"
    pa-4
    d-flex
    align-center
    justify-center
    flex-grow-1
  >
    <v-progress-circular indeterminate v-if="!dataLoaded" />
    <v-data-table
      v-else
      :headers="headers"
      :items="activeBuyList ? activeBuyList.batches : []"
      :items-per-page="-1"
      hide-default-footer
      fixed-header
      dense
      class="elevation-1"
    >
      <template v-slot:top>
        <v-layout flex-column class="header elevation-1">
          <v-layout justify-center align-center pt-4 px-4>
            <span class="text-center">{{ fromStation.name }}</span>
            <v-hover v-slot:default="{ hover }">
              <v-btn
                class="mx-4"
                :class="{ rotated: hover }"
                icon
                @click="swapStations()"
              >
                <v-icon click>mdi-arrow-right</v-icon>
              </v-btn>
            </v-hover>
            <span class="text-center">{{ toStation.name }}</span>
          </v-layout>
          <v-row no-gutters>
            <v-col cols="12" lg="4" class="d-flex align-center px-4">
              <v-slider
                v-model="roi"
                min="1"
                prepend-icon="mdi-percent"
                thumb-label
                dense
                hide-details
                label="ROI"
              />
            </v-col>
            <v-col
              cols="12"
              lg="2"
              class="d-flex align-center justify-center justify-lg-end px-4"
            >
              <v-switch v-model="allowDuplicates" label="Allow duplicates" />
            </v-col>
            <v-col
              v-if="!!activeBuyList && allowDuplicates"
              cols="12"
              lg="6"
              class="d-flex align-center justify-center justify-lg-end px-4"
            >
              <amount
                title="Current list buy price"
                icon="mdi-credit-card-minus-outline"
              >
                {{ currency(activeBuyList.totalBuyAt) }} ISK
              </amount>
              <amount
                title="Current list sell price (excluding sales tax)"
                icon="mdi-credit-card-plus-outline"
              >
                {{ currency(activeBuyList.totalSellAt) }} ISK
              </amount>
              <amount title="Current list net profit" icon="mdi-cash-plus">
                {{ currency(activeBuyList.totalNetProfit) }} ISK
              </amount>
            </v-col>
          </v-row>
        </v-layout>
      </template>
      <template v-slot:item.quantity="{ item }">
        <v-edit-dialog :return-value="item.quantity">
          {{ integer(item.quantity) }}
          <template v-slot:input>
            <v-text-field
              v-quantity
              :value="integer(item.quantity)"
              @change="changeQuantity(item, $event)"
            />
          </template>
        </v-edit-dialog>
      </template>
      <template v-slot:item.buyAt="{ item }">
        <span>{{ currency(item.buyAt) }}</span>
      </template>
      <template v-slot:item.sellAt="{ item }">
        <span>{{ currency(item.sellAt) }}</span>
      </template>
      <template v-slot:item.netProfit="{ item }">
        <span>{{ currency(item.netProfit) }}</span>
      </template>
      <template v-slot:item.copy="{ item }">
        <v-icon small :color="item.copied ? 'white' : 'grey'">
          mdi-content-copy
        </v-icon>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small @click="removeBatch(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:no-data>
        Empty
      </template>
      <template v-if="!!activeBuyList" v-slot:footer>
        <v-layout d-flex align-end class="footer">
          <v-layout d-flex justify-space-between align-center ma-4 wrap>
            <amount
              title="Total buy price"
              icon="mdi-credit-card-minus-outline"
            >
              {{ currency(loadInfo.totalBuyAt) }} ISK
            </amount>
            <amount
              title="Total sell price (excluding sales tax)"
              icon="mdi-credit-card-plus-outline"
            >
              {{ currency(loadInfo.totalSellAt) }} ISK
            </amount>
            <amount title="Cargo capacity left" icon="mdi-package-variant">
              {{ volume(loadInfo.volumeLeft) }} m<sup>3</sup>
            </amount>
            <amount title="Budget left" icon="mdi-cash">
              {{ currency(loadInfo.budgetLeft) }} ISK
            </amount>
            <amount title="Total net profit" icon="mdi-cash-plus">
              {{ currency(loadInfo.totalNetProfit) }} ISK
            </amount>
            <v-layout justify-end>
              <v-btn class="mr-4" @click="refit()">Refit</v-btn>
              <v-btn class="mr-4" @click="copyActiveBuyList()">Copy</v-btn>
              <v-btn @click="syncBuyList()">Sync</v-btn>
            </v-layout>
          </v-layout>
        </v-layout>
        <v-pagination
          v-if="allowDuplicates"
          v-model="page"
          :length="buyLists.length"
          class="pb-4 px-2 ml-auto"
        ></v-pagination>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar" top>
      {{ snackText }}
      <v-btn dark text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-container>
</template>
