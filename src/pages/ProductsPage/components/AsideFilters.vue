<template>
  <aside class="market-aside">
    <div class="market-aside__head">
      <div class="market-aside__heading">
        <SvgIcon :icon="FilterIcon" class="market-aside__filter-icon" />
        <span>{{ $t('Filters') }}</span>
      </div>

      <button type="button" class="market-aside__reset" @click="handleReset">
        {{ $t('Reset all') }}
      </button>
    </div>

    <div class="market-aside__content">
      <div class="market-aside__price">
        <div class="market-aside__section-label">
          {{ $t('Price') }}
        </div>

        <PriceRange
          v-model:min="minPrice"
          v-model:max="maxPrice"
          class="market-aside__price-range"
          :currency-symbol="currencyStore.currentCurrencySymbol"
          placeholder-min="0"
          placeholder-max="10000"
          @change="handlePriceChange"
        />
      </div>

      <BaseDdropdown
        v-if="qualityOptions.length"
        :key="`${currentGame}-rarity`"
        class="market-aside__dropdown"
        variant="sidebar"
        :label="$t('Rarity')"
        :close-on-outside="false"
        :close-on-escape="false"
      >
        <BaseCheckbox
          class="market-aside__option"
          :model-value="!selectedQualities.length"
          @update:model-value="clearQualities"
          variant="radio"
        >
          {{ $t('All') }}
        </BaseCheckbox>

        <BaseCheckbox
          variant="radio"
          v-for="option in qualityOptions"
          :key="option.value"
          class="market-aside__option"
          :model-value="selectedQualities.includes(option.value)"
          @update:model-value="toggleMulti('quality', option.value)"
        >
          <span class="market-aside__option-text">
            <span
              class="market-aside__rarity-dot"
              :style="{
                backgroundColor: rarityColor(option.value),
              }"
            />
            {{ decodeHtml(option.label) }}
          </span>
        </BaseCheckbox>
      </BaseDdropdown>

      <BaseDdropdown
        v-if="typeOptions.length"
        :key="`${currentGame}-type`"
        class="market-aside__dropdown"
        variant="sidebar"
        :label="$t('Item type')"
        :close-on-outside="false"
        :close-on-escape="false"
      >
        <BaseCheckbox
          class="market-aside__option"
          :model-value="!selectedTypes.length && !selectedSubcategories.length"
          @update:model-value="clearTypes"
          variant="radio"
        >
          {{ $t('All') }}
        </BaseCheckbox>

        <BaseCheckbox
          variant="radio"
          v-for="option in typeOptions"
          :key="option.value"
          class="market-aside__option"
          :model-value="selectedTypes.includes(option.value)"
          @update:model-value="toggleMulti('type', option.value)"
        >
          {{ decodeHtml(option.label) }}
        </BaseCheckbox>
      </BaseDdropdown>

      <BaseDdropdown
        v-if="isCs2 && exteriorOptions.length"
        class="market-aside__dropdown"
        variant="sidebar"
        :label="$t('Exterior')"
        :close-on-outside="false"
        :close-on-escape="false"
      >
        <BaseCheckbox
          variant="radio"
          class="market-aside__option"
          :model-value="!selectedExterior.length"
          @update:model-value="clearExterior"
        >
          {{ $t('All') }}
        </BaseCheckbox>

        <BaseCheckbox
          variant="radio"
          v-for="option in exteriorOptions"
          :key="option.value"
          class="market-aside__option"
          :model-value="selectedExterior.includes(option.value)"
          @update:model-value="toggleMulti(exteriorKey, option.value)"
        >
          {{ decodeHtml(option.label) }}
        </BaseCheckbox>
      </BaseDdropdown>

      <BaseDdropdown
        v-if="isDota2 && heroOptions.length"
        class="market-aside__dropdown"
        variant="sidebar"
        :label="$t('Heroes')"
        :close-on-outside="false"
        :close-on-escape="false"
      >
        <BaseCheckbox
          variant="radio"
          class="market-aside__option"
          :model-value="!selectedHeroes.length"
          @update:model-value="clearHeroes"
        >
          {{ $t('All') }}
        </BaseCheckbox>

        <BaseCheckbox
          variant="radio"
          v-for="option in heroOptions"
          :key="option.value"
          class="market-aside__option"
          :model-value="selectedHeroes.includes(option.value)"
          @update:model-value="toggleMulti('hero', option.value)"
        >
          {{ decodeHtml(option.label) }}
        </BaseCheckbox>
      </BaseDdropdown>
    </div>
  </aside>
</template>

<script setup>
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import PriceRange from '@/components/base/PriceRange.vue'
import BaseDdropdown from '@/components/dropdown/BaseDdropdown.vue'
import { FilterIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useCurrencyStore } from '@/stores/currency'

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  availableFilters: {
    type: Object,
    default: () => ({}),
  },
  currentGame: {
    type: String,
    default: 'cs2',
  },
  updateFilters: {
    type: Function,
    required: true,
  },
  resetFilters: {
    type: Function,
    required: true,
  },
})

const currencyStore = useCurrencyStore()

const minPrice = ref('')
const maxPrice = ref('')

const isCs2 = computed(() => props.currentGame === 'cs2')

const isDota2 = computed(() => props.currentGame === 'dota2')

const selectedTypes = computed(() =>
  Array.isArray(props.filters.type) ? props.filters.type : [],
)

const selectedSubcategories = computed(() =>
  Array.isArray(props.filters.subcategories) ? props.filters.subcategories : [],
)

const selectedQualities = computed(() =>
  Array.isArray(props.filters.quality) ? props.filters.quality : [],
)

const selectedHeroes = computed(() =>
  Array.isArray(props.filters.hero) ? props.filters.hero : [],
)

const toOptions = items =>
  Array.isArray(items)
    ? items.map(item => {
        if (typeof item === 'string') {
          return {
            label: item,
            value: item,
          }
        }

        return {
          label: item.label ?? item.value,
          value: item.value ?? item.label,
        }
      })
    : []

const qualityOptions = computed(() =>
  toOptions(props.availableFilters.qualities),
)

const heroOptions = computed(() => toOptions(props.availableFilters.heroes))

const exteriorNames = computed(() =>
  toOptions(props.availableFilters.exterior_names),
)

const exteriorKey = computed(() =>
  exteriorNames.value.length ? 'exterior_name' : 'quality',
)

const exteriorOptions = computed(() =>
  exteriorNames.value.length ? exteriorNames.value : qualityOptions.value,
)

const selectedExterior = computed(() =>
  Array.isArray(props.filters[exteriorKey.value])
    ? props.filters[exteriorKey.value]
    : [],
)

const typeOptions = computed(() => {
  if (
    isCs2.value &&
    Array.isArray(props.availableFilters.subcategories) &&
    props.availableFilters.subcategories.length
  ) {
    return props.availableFilters.subcategories.map(item => ({
      value: item.category,
      label: item.category,
    }))
  }

  return toOptions(props.availableFilters.types)
})

const decodeHtml = value => {
  if (typeof document === 'undefined') {
    return String(value || '')
  }

  const element = document.createElement('textarea')
  element.innerHTML = String(value || '')

  return element.value
}

const rarityColor = name => {
  const value = String(name).toLowerCase()

  if (value.includes('arcana') || value.includes('contraband')) {
    return '#7ad76e'
  }

  if (value.includes('immortal') || value.includes('covert')) {
    return '#f2d70b'
  }

  if (value.includes('legendary') || value.includes('classified')) {
    return '#dd4aa6'
  }

  if (value.includes('mythical') || value.includes('restricted')) {
    return '#a66aff'
  }

  if (value.includes('rare') || value.includes('milspec')) {
    return '#368dff'
  }

  if (value.includes('uncommon')) {
    return '#65b9f0'
  }

  return '#99a1b0'
}

const toggleMulti = (key, value) => {
  const current = Array.isArray(props.filters[key])
    ? [...props.filters[key]]
    : []

  const index = current.indexOf(value)

  if (index === -1) {
    current.push(value)
  } else {
    current.splice(index, 1)
  }

  props.updateFilters({
    [key]: current,
    page: 1,
  })
}

const clearQualities = () =>
  props.updateFilters({
    quality: [],
    page: 1,
  })

const clearTypes = () =>
  props.updateFilters({
    type: [],
    subcategories: [],
    page: 1,
  })

const clearHeroes = () =>
  props.updateFilters({
    hero: [],
    page: 1,
  })

const clearExterior = () =>
  props.updateFilters({
    quality: [],
    exterior_name: [],
    page: 1,
  })

const debouncedPrice = debounce(() => {
  const min = minPrice.value === '' ? null : Number(minPrice.value)

  const max = maxPrice.value === '' ? null : Number(maxPrice.value)

  if (min !== null && max !== null && min > max) {
    return
  }

  props.updateFilters({
    priceRange: {
      min,
      max,
    },
    page: 1,
  })
}, 350)

const handlePriceChange = () => {
  debouncedPrice()
}

watch(
  () => [props.filters.priceRange?.min, props.filters.priceRange?.max],
  ([min, max]) => {
    minPrice.value = min ?? ''
    maxPrice.value = max ?? ''
  },
  { immediate: true },
)

const handleReset = () => {
  debouncedPrice.cancel()

  minPrice.value = ''
  maxPrice.value = ''

  props.resetFilters()
}

onBeforeUnmount(() => {
  debouncedPrice.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.market-aside {
  width: 100%;
  border: 1px solid rgba(153, 161, 176, 0.13);
  border-radius: 10px;
  background: var(--bg-fourth-color);
  overflow: visible;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 62px;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(153, 161, 176, 0.09);
    background: rgba(0, 0, 0, 0.12);
    border-radius: 10px 10px 0 0;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--third-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 600;
  }

  &__filter-icon {
    display: flex;
    width: 17px;
    height: 17px;
    color: var(--fifth-color);
  }

  &__reset {
    padding: 4px 0;
    background: transparent;
    border: 0;
    color: #5da0ff;
    font-family: var(--font-inter);
    font-size: 12px;
    white-space: nowrap;
    cursor: pointer;

    @media (any-hover: hover) {
      &:hover {
        color: #fff;
      }
    }
  }

  &__content {
    padding: 12px 16px 16px;
  }

  &__section-label {
    margin-bottom: 12px;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 600;
    color: var(--fifth-color);
    text-transform: uppercase;
  }

  &__price {
    padding-bottom: 16px;
  }

  &__price-range {
    width: 100%;

    :deep(.price-range__field) {
      max-width: none;
      min-width: 0;
    }

    :deep(.price-range) {
      gap: 8px;
    }

    :deep(.base-input) {
      min-height: 42px;
      border-radius: 6px;
      background: rgba(153, 161, 176, 0.09);
    }

    :deep(.base-input__control) {
      font-size: 12px;
    }
  }

  &__dropdown {
    position: relative;
  }

  &__option {
    padding: 3px 4px;
  }

  &__option-text {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  &__rarity-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex: 0 0 7px;
  }
}
</style>
