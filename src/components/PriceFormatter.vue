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
  size: { type: String, default: 'size-14' }, // size-14
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
  &.size-14 {
    gap: 6px;

    .price__image {
      min-width: 16px;
      height: 16px;
    }
    .price__currency,
    .price__number {
      font-size: 14px;
    }
  }
  &__image {
  }

  &__currency,
  &__number {
    color: inherit;
    font-family: var(--font-audiowide);
    font-weight: 400;
    line-height: 100%;
  }
}
</style>
