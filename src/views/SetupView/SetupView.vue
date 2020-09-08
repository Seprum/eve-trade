<style lang="scss" src="./SetupView.scss" scoped></style>
<script lang="ts" src="./SetupView.ts"></script>

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
        hide-details
        :items="fromStations"
        :value="fromStationId"
        @input="setFromStation($event)"
      />
      <v-btn
        class="mx-auto mt-4"
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
        hide-details
        :items="toStations"
        :value="toStationId"
        @input="setToStation($event)"
      />
      <v-row class="d-flex">
        <v-col>
          <v-text-field
            type="number"
            label="Budget"
            suffix="ISK"
            :value="budget"
            @input="setBudget(+$event)"
            @keypress="validateKeys"
            :messages="currency(budget)"
          />
        </v-col>
        <v-col>
          <v-text-field
            type="number"
            label="Cargo Capacity"
            :value="cargoCapacity"
            @input="setCargoCapacity(+$event)"
            @keypress="validateKeys"
            :messages="volume(cargoCapacity)"
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
        to="/results"
        :disabled="
          !fromStationId || !toStationId || fromStationId === toStationId
        "
      >
        Show results
      </v-btn>
    </v-card>
  </v-container>
</template>
