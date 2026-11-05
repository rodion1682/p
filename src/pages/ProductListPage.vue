<template>
  <main class="products">
    <div class="products__background _ibg" aria-hidden="true">
      <img src="@/assets/img/products-bg.png" alt="" />
    </div>
    <div class="products__inner _cnt-home">
      <div class="products__heading">
        <h1 class="products__title _h2">{{ $t('SHOP') }}</h1>
        <form
          class="products__search"
          role="search"
          @submit.prevent="submitSearch"
        >
          <SvgIcon :icon="SearchIcon" class="products__search-icon" />
          <input
            v-model="searchText"
            type="search"
            :placeholder="$t('Search')"
            :aria-label="$t('Search')"
          />
        </form>
      </div>

      <div class="products__layout">
        <aside class="products__sidebar" :aria-label="$t('Filters')">
          <div class="products__filter-group">
            <h2 class="products__filter-title _h4">{{ $t('SORT BY') }}</h2>
            <BaseSelect
              variant="products"
              :model-value="filters.sort"
              :options="sortOptions"
              @update:modelValue="setSort"
            />
          </div>

          <div class="products__filter-group">
            <h2 class="products__filter-title _h4">{{ $t('PRICE') }}</h2>
            <div class="products__price-labels">
              <span>{{ $t('FROM:') }}</span
              ><span>{{ $t('TO:') }}</span>
            </div>
            <PriceRange
              v-model:min="minPrice"
              v-model:max="maxPrice"
              class="products__price"
              :placeholder-min="'0.00'"
              :placeholder-max="'0.00'"
              :currency-symbol="currencyStore.currentCurrencySymbol"
              @change="handlePriceRangeChange"
            />
          </div>

          <div class="products__filter-group products__filter-group_type">
            <h2 class="products__filter-title _h4">{{ $t('TYPE') }}</h2>
            <div class="products__categories">
              <BaseCheckbox
                variant="products"
                :model-value="!filters.subcategories?.length"
                @update:modelValue="selectAllCategories"
              >
                {{ $t('All') }}
                <span class="products__count">({{ pagination.total }})</span>
              </BaseCheckbox>
              <BaseCheckbox
                v-for="category in visibleCategories"
                :key="category.id"
                variant="products"
                :model-value="
                  filters.subcategories?.includes(String(category.id))
                "
                @update:modelValue="toggleCategory(category.id)"
              >
                {{ category.name }}
                <span v-if="category.count != null" class="products__count"
                  >({{ category.count }})</span
                >
              </BaseCheckbox>
            </div>
            <BaseDdropdown
              v-if="visibleCategories.length > 6"
              class="products__more-categories"
              variant="products"
              :label="$t('More categories')"
              absolute
            >
              <BaseCheckbox
                v-for="category in visibleCategories.slice(6)"
                :key="category.id"
                variant="products"
                :model-value="
                  filters.subcategories?.includes(String(category.id))
                "
                @update:modelValue="toggleCategory(category.id)"
                >{{ category.name }}</BaseCheckbox
              >
            </BaseDdropdown>
          </div>

          <BaseButton
            v-if="hasActiveFilters"
            variant="bordered"
            class="products__reset"
            @click="resetAll"
            >{{ $t('Reset All Filters') }}</BaseButton
          >
        </aside>

        <div class="products__results">
          <LoadingSpinner v-if="!ready || loading" class="products__loading" />
          <div v-else-if="error" class="products__empty">
            <p class="_text-error">{{ error }}</p>
            <BaseButton variant="bordered" @click="fetchProductsImmediate">{{
              $t('Try again')
            }}</BaseButton>
          </div>
          <div v-else-if="products.length" class="products__items">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />
          </div>
          <div v-else class="products__empty">
            <p>{{ $t('No products found') }}</p>
            <BaseButton variant="bordered" @click="resetAll">{{
              $t('Reset filters')
            }}</BaseButton>
          </div>
          <PaginationComponent
            v-if="
              ready && !loading && !error && pagination.total > filters.perPage
            "
            class="products__pagination"
            :total-pages="Math.ceil(pagination.total / filters.perPage)"
            :current-page="Number(filters.page)"
            @update:current-page="onPageChange"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceRange from '@/components/base/PriceRange.vue'
import BaseDdropdown from '@/components/dropdown/BaseDdropdown.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductCard from '@/components/ProductCard.vue'
import { SORT_OPTIONS, useProductList } from '@/composables/useProductList'
import { useCurrencyStore } from '@/stores/currency'

const { t } = useI18n()
const currencyStore = useCurrencyStore()
const {
  products,
  loading,
  error,
  ready,
  filters,
  pagination,
  availableFilters,
  updateFilters,
  resetFilters,
  fetchProductsImmediate,
} = useProductList()

const sortOptions = computed(() =>
  SORT_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.label),
  })),
)
const visibleCategories = computed(() =>
  Array.isArray(availableFilters.subcategories)
    ? availableFilters.subcategories
    : [],
)
const hasActiveFilters = computed(
  () =>
    Boolean(filters.search) ||
    filters.sort !== 'desc' ||
    Boolean(filters.subcategories?.length) ||
    filters.priceRange?.min != null ||
    filters.priceRange?.max != null,
)

const searchText = ref(filters.search || '')
const minPrice = ref(filters.priceRange?.min ?? '')
const maxPrice = ref(filters.priceRange?.max ?? '')

const setSort = value => updateFilters({ sort: value, page: 1 })
const toggleCategory = id => {
  const selected = [...(filters.subcategories || [])]
  const key = String(id)
  const index = selected.indexOf(key)
  if (index >= 0) selected.splice(index, 1)
  else selected.push(key)
  return updateFilters({ subcategories: selected, page: 1 })
}
const selectAllCategories = () => updateFilters({ subcategories: [], page: 1 })
const submitSearch = () => {
  const search = searchText.value.trim()
  if (search !== (filters.search || '')) updateFilters({ search, page: 1 })
}
const debouncedSearch = debounce(submitSearch, 350)
watch(searchText, () => debouncedSearch())
watch(
  () => filters.search,
  value => {
    if ((value || '') !== searchText.value) searchText.value = value || ''
  },
)

const debouncedPriceChange = debounce(() => {
  const min = minPrice.value === '' ? null : Number(minPrice.value)
  const max = maxPrice.value === '' ? null : Number(maxPrice.value)
  if (min != null && max != null && min > max) return
  updateFilters({ priceRange: { min, max }, page: 1 })
}, 500)
const handlePriceRangeChange = () => debouncedPriceChange()
watch(
  () => filters.priceRange,
  value => {
    minPrice.value = value?.min ?? ''
    maxPrice.value = value?.max ?? ''
  },
  { deep: true },
)
watch(
  () => currencyStore.currentCurrencyCode,
  (next, old) => {
    if (!next || next === old) return
    debouncedPriceChange.cancel()
    minPrice.value = ''
    maxPrice.value = ''
    filters.priceRange.min = null
    filters.priceRange.max = null
    filters.page = 1
    fetchProductsImmediate()
  },
)
const resetAll = async () => {
  debouncedSearch.cancel()
  debouncedPriceChange.cancel()
  searchText.value = ''
  minPrice.value = ''
  maxPrice.value = ''
  await resetFilters()
}
const onPageChange = async page => {
  await updateFilters({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
onBeforeUnmount(() => {
  debouncedSearch.cancel()
  debouncedPriceChange.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.products {
  position: relative;
  @include adaptiveValue('padding-top', 114, 80);
  @include adaptiveValue('padding-bottom', 100, 30);
  &__background {
    position: absolute;
    width: 100%;
    height: 60%;
    top: 0;
    left: 0;
  }
  &__inner {
    position: relative;
  }
  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    @include adaptiveValue('margin-bottom', 32, 20);
  }
  &__title {
    margin: 0;
    color: var(--primary-color);
  }
  &__search {
    width: min(100%, 300px);
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border-primary-color);
    border-radius: 6px;
    padding: 0 12px;
    background: var(--bg-third-color);
    &:focus-within {
      border-color: var(--hint-primary-color);
    }
    input {
      background: transparent;
      border: 0;
      outline: none;
      min-width: 0;
      width: 100%;
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 14px;
      &::placeholder {
        color: var(--hint-third-color);
      }
    }
    &-icon {
      width: 16px;
      height: 16px;
      color: var(--hint-third-color);
      flex-shrink: 0;
    }
  }
  &__layout {
    display: grid;
    grid-template-columns: minmax(230px, 285px) minmax(0, 1fr);
    @include adaptiveValue('gap', 24, 12);
    align-items: start;
  }
  &__sidebar {
    min-width: 0;
    border: 1px solid var(--border-primary-color);
    border-radius: 5px;
    @include adaptiveValue('padding', 20, 12);
    background: var(--bg-fourth-color);
  }
  &__filter-group {
    &:not(:last-of-type) {
      border-bottom: 1px solid var(--border-primary-color);
      @include adaptiveValue('padding-bottom', 22, 14);
      @include adaptiveValue('margin-bottom', 22, 14);
    }
  }
  &__filter-title {
    margin: 0 0 16px;
  }
  &__price-labels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    color: var(--hint-third-color);
    font-size: 11px;
    margin-bottom: 5px;
  }
  &__price {
    :deep(.price-range__label) {
      display: none;
    }

    :deep(.price-range__inputs) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    :deep(.price-range__input) {
      min-width: 0;
      max-width: none;
      width: 100%;
    }

    :deep(.base-input) {
      background: var(--bg-third-color);
      border-color: var(--border-primary-color);
    }

    :deep(.base-input__placeholder) {
      color: var(--primary-color);
      opacity: 1;

      transition: opacity 0.2s ease;
    }

    :deep(.base-input.is-focused .base-input__placeholder),
    :deep(.base-input.is-filled .base-input__placeholder) {
      opacity: 0;
    }
  }
  &__categories {
    display: flex;
    flex-direction: column;
    gap: 0;
    > :not(:last-child) {
      border-bottom: 1px solid var(--border-primary-color);
    }
    > :first-child {
      margin-bottom: 3px;
    }
    > :nth-child(n + 8) {
      display: none;
    }
  }
  &__count {
    color: var(--hint-third-color);
    margin-left: 6px;
    opacity: 0.7;
  }
  &__more-categories {
    margin-top: 12px;
  }
  &__reset {
    width: 100%;
    margin-top: 16px;
  }
  &__results {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  &__items {
    display: grid;

    grid-template-columns: repeat(5, minmax(0, 1fr));
    @include adaptiveValue('gap', 10, 4);
  }
  &__loading {
    margin: auto;
  }
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    text-align: center;
    flex: 1 1 100%;
    max-width: 300px;
    margin: auto;
  }
  &__pagination {
    margin-top: 32px;
    align-self: flex-end;
  }
  @media (max-width: $md2) {
    &__layout {
      grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
    }
    &__items {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  @media (max-width: $md3) {
    &__items {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: $md4) {
    &__heading {
      align-items: stretch;
      flex-direction: column;
    }
    &__search {
      width: 100%;
    }
    &__layout {
      grid-template-columns: minmax(0, 1fr);
    }
    &__items {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    &__pagination {
      align-self: center;
    }
  }
  @media (max-width: $md6) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__sidebar {
      padding: 14px;
    }
  }
  @media (max-width: 360px) {
    &__items {
      // grid-template-columns: 1fr;
    }
  }
}
</style>
