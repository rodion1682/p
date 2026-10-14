<template>
  <div class="price" v-bind="attrs" :class="[size]">
    <div
      v-if="props.price !== undefined && props.price !== null"
      class="price__number"
    >
      {{ parseFloat(props.price).toFixed(2) }}
    </div>
    <div
      v-if="settingsStore.settings?.internal_currency?.image"
      class="price__image _ibg-contain"
    >
      <img
        :src="settingsStore.settings?.internal_currency?.image"
        alt="Currency"
      />
    </div>
    <div v-else class="price__currency">
      {{ settingsStore.settings?.internal_currency?.name }}
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useAttrs } from 'vue'

const attrs = useAttrs()
const props = defineProps({
  price: {
    type: [Number, String],
    required: false,
  },
  balance: {
    type: Boolean,
    required: false,
  },
  isCurrency: { type: Boolean, default: false },
  size: { type: String, default: 'size-20' }, // size-12 | size-14 | size-16 |  size-20 | size-24 | size-32 | size-48 | size-64
})

const settingsStore = useSettingsStore()
</script>

<style lang="scss" scoped>
.price {
  display: flex;
  align-items: center;

  width: fit-content;
  height: fit-content;

  transition: color 0.3s ease 0s;
  &.size-64 {
    @include adaptiveValue('gap', 19, 10);

    color: var(--primary-color);
    .price__image {
      @include adaptiveValue('min-width', 64, 34);
      @include adaptiveValue('height', 64, 34);
    }
    .price__number {
      @include adaptiveValue('font-size', 64, 34);
      line-height: 100%;
    }
  }
  &.size-48 {
    @include adaptiveValue('gap', 16, 10);

    color: var(--primary-color);
    .price__image {
      @include adaptiveValue('min-width', 46, 33);
      @include adaptiveValue('height', 46, 33);
    }
    .price__number {
      @include adaptiveValue('font-size', 48, 35);
      @include adaptiveValue('line-height', 64, 51);
    }
  }
  &.size-32 {
    gap: 8px;

    color: var(--primary-color);
    .price__image {
      @include adaptiveValue('min-width', 32, 25);
      @include adaptiveValue('height', 32, 25);
    }
    .price__number {
      @include adaptiveValue('font-size', 32, 25);
      @include adaptiveValue('line-height', 42, 35);
    }
  }
  &.size-12 {
    gap: 4px;
    .price__image {
      min-width: 12px;
      height: 12px;
    }
    .price__number {
      color: var(--secondary-color);
      font-family: var(--font-inter);
      font-size: 12px;
    }
  }
  &.size-24 {
    gap: 10px;

    color: var(--primary-color);
    .price__image {
      @include adaptiveValue('min-width', 24, 20);
      @include adaptiveValue('height', 24, 20);
    }
    .price__number {
      @include adaptiveValue('font-size', 24, 20);
    }
  }

  &.size-20 {
    gap: 8px;

    color: var(--primary-color);
    .price__image {
      @include adaptiveValue('min-width', 18, 16);
      @include adaptiveValue('height', 18, 16);
    }
    .price__number {
      @include adaptiveValue('font-size', 20, 18);
      @include adaptiveValue('line-height', 27, 25);
    }
  }
  &.size-14 {
    flex-direction: row-reverse !important;
    gap: 6px;

    color: var(--secondary-color);
    .price__image {
      min-width: 16px;
      height: 16px;
    }
    .price__number {
      font-family: var(--font-inter) !important;
      font-size: 14px;
      line-height: 17px;
    }
  }
  &.size-16 {
    gap: 6px;

    color: var(--secondary-color);
    .price__image {
      min-width: 16px;
      height: 16px;
    }
    .price__number {
      font-family: var(--font-inter) !important;
      font-size: 14px;
      line-height: 17px;
    }
  }
  &__image {
  }

  &__currency,
  &__number {
    color: inherit;
    font-family: var(--font-spectral);
    font-weight: 700;
    line-height: 100%;
  }
}
</style>
