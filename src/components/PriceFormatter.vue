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
  size: { type: String, default: 'size-28' }, // size-28
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
  &.size-28 {
    gap: 8px;

    color: var(--primary-color);
    .price__image {
      @include adaptiveValue('min-width', 24, 20);
      @include adaptiveValue('height', 24, 20);
    }
    .price__number {
      @include adaptiveValue('font-size', 28, 24);
      line-height: 100%;
    }
  }
  &__image {
  }

  &__currency,
  &__number {
    color: inherit;
    font-family: var(--font-ancizar-serif);
    font-weight: 700;
    line-height: 100%;
  }
}
</style>
