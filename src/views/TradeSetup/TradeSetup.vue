<template>
  <v-container height="100%" class="d-flex flex-column justify-between">
    <v-card
      class="pa-2 pl-4 ma-2 mb-4 d-flex align-center justify-space-between"
    >
      <div class="caption">
        <span class="font-weight-bold">Status:</span>
        {{ ` ${loadingStatus}` }}
      </div>
      <v-btn icon title="Reload static EVE data" @click="refreshStaticData()">
        <v-icon click>mdi-reload</v-icon>
      </v-btn>
    </v-card>
    <v-card class="pa-4 mx-2 d-flex flex-column align-stretch">
      <v-autocomplete
        label="From"
        item-value="id"
        item-text="name"
        prepend-icon="mdi-location-exit"
        :items="stations"
        :value="fromStationId"
        @input="setFromStation($event)"
      />
      <v-btn
        class="mx-auto"
        icon
        :disabled="!fromStationId || !toStationId"
        @click="swapStations()"
      >
        <v-icon click>mdi-swap-vertical</v-icon>
      </v-btn>
      <v-autocomplete
        label="To"
        item-value="id"
        item-text="name"
        prepend-icon="mdi-location-enter"
        :items="stations"
        :value="toStationId"
        @input="setToStation($event)"
      />
      <v-row class="d-flex">
        <v-col>
          <v-text-field
            v-currency
            label="Budget"
            suffix="ISK"
            :value="budget"
            @change="setBudget($event)"
          />
        </v-col>
        <v-col>
          <v-text-field
            v-volume
            label="Cargo Capacity"
            :value="cargoCapacity"
            @change="setCargoCapacity($event)"
          >
            <template slot="append">
              m
              <sup>3</sup>
            </template>
          </v-text-field>
        </v-col>
        <v-col>
          <v-select
            label="Sales Tax"
            suffix="%"
            type="number"
            item-value="value"
            item-text="label"
            :items="taxOptions"
            :value="selectedTaxOption"
            @change="setTax($event)"
          />
        </v-col>
      </v-row>
      <v-btn
        to="/result"
        :disabled="
          !fromStationId || !toStationId || fromStationId === toStationId
        "
        >Calculate</v-btn
      >
    </v-card>
  </v-container>
</template>

<script lang="ts" src="./TradeSetup.ts"></script>
<style lang="scss" src="./TradeSetup.scss" scoped></style>
