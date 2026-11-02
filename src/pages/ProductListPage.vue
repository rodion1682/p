<template>
  <div class="products">
    <div class="products__inner _cnt">
      <div class="products__bg _ibg">
        <img src="@/assets/img/products-bg.png" />
      </div>
      <div class="products__title _h3">{{ $t('Market') }}</div>
      <div class="products__filters">
        <div class="products__filters-top">
          <BaseInput
            v-model="searchText"
            class="products__search"
            :placeholder="$t('Search')"
            ><template #suffix>
              <BaseButton class="products__search-button" @click="submitSearch">
                {{ $t('Search') }}
              </BaseButton>
              <SvgIcon
                v-if="false"
                :icon="SearchIcon"
                class="products__search-icon"
            /></template>
          </BaseInput>
          <div class="products__dropdown">
            <BaseDdropdown
              v-if="visibleCategories.length"
              :label="getCategoriesDropdownLabel()"
              absolute
            >
              <BaseCheckbox
                v-for="category in visibleCategories"
                :key="category.id"
                :modelValue="
                  filters.subcategories?.includes(String(category.id))
                "
                class="products__checkbox"
                @update:modelValue="toggleCategoryFromDropdown(category.id)"
              >
                {{ category.name }}
              </BaseCheckbox>
            </BaseDdropdown>
          </div>
          <PriceRange
            class="products__price-range"
            v-model:min="minPrice"
            v-model:max="maxPrice"
            :from-label="$t('0')"
            :to-label="$t('1500')"
            :currency-symbol="currencyStore.currentCurrencySymbol"
            :placeholder-min="$t('From')"
            :placeholder-max="$t('To')"
            @change="handlePriceRangeChange"
          />
          <div class="products__dropdown products__dropdown_sort">
            <BaseDdropdown :label="getSortLabel()" absolute>
              <BaseCheckbox
                v-for="option in SORT_OPTIONS"
                :key="option.value"
                :modelValue="filters.sort === option.value"
                class="products__checkbox"
                @update:modelValue="toggleSortFromDropdown(option.value)"
              >
                {{ $t(option.label) }}
              </BaseCheckbox>
            </BaseDdropdown>
          </div>
        </div>
        <BaseButton
          v-if="hasActiveFilters"
          class="products__refresh"
          @click="resetAll"
          variant="bordered"
        >
          {{ $t('Reset All Filters') }}
        </BaseButton>
      </div>

      <div v-if="pagination.total && false" class="products__length">
        {{ pagination.total }}
        {{ pagination.total === 1 ? $t('item') : $t('items') }}
      </div>

      <div class="products__body">
        <LoadingSpinner v-if="!ready || loading" class="products__loading" />

        <div v-else-if="error" class="products__empty">
          <div class="products__empty-error _text-error">
            {{ error }}
          </div>

          <BaseButton
            variant="bordered"
            class="products__empty-button"
            @click="fetchProductsImmediate"
          >
            {{ $t('Try again') }}
          </BaseButton>
        </div>

        <div v-else-if="products.length" class="products__items">
          <div
            v-for="product in products"
            :key="product.id"
            class="products__item"
          >
            <ProductCard :product="product" @select="handleSelectProduct" />
          </div>
        </div>

        <div v-else class="products__found">
          <div class="products__found-text _l">
            {{ $t('No products found') }}
          </div>

          <BaseButton
            variant="bordered"
            class="products__found-button"
            @click="resetAll"
          >
            {{ $t('Reset filters') }}
          </BaseButton>
        </div>
        <div class="products__bottom">
          <BaseDdropdown
            class="products__per-page-dorpdown"
            :label="getPerPageLabel()"
            absolute
            v-if="false"
          >
            <BaseCheckbox
              v-for="option in PER_PAGE_OPTIONS"
              :key="option.value"
              :modelValue="filters.perPage === option.value"
              class="products__checkbox"
              @update:modelValue="changePerPage(option.value)"
            >
              {{ option.label }}
            </BaseCheckbox>
          </BaseDdropdown>

          <PaginationComponent
            v-if="pagination.total > filters.perPage"
            class="products__pagination"
            :total-pages="Math.ceil(pagination.total / filters.perPage)"
            :current-page="Number(filters.page)"
            @update:current-page="onPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import PriceRange from '@/components/base/PriceRange.vue'
import BaseDdropdown from '@/components/dropdown/BaseDdropdown.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductCard from '@/components/ProductCard.vue'

import BaseInput from '@/components/base/BaseInput.vue'
import { SORT_OPTIONS, useProductList } from '@/composables/useProductList'
import { useCurrencyStore } from '@/stores/currency'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const currencyStore = useCurrencyStore()

const {
  PER_PAGE_OPTIONS,
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

const minPrice = ref('')
const maxPrice = ref('')
const searchText = ref(filters.search || '')

const visibleCategories = computed(() =>
  Array.isArray(availableFilters.subcategories)
    ? availableFilters.subcategories
    : [],
)

const hasActiveFilters = computed(() => {
  return (
    !!filters.search ||
    filters.sort !== 'desc' ||
    (filters.subcategories?.length ?? 0) > 0 ||
    filters.priceRange?.min != null ||
    filters.priceRange?.max != null ||
    minPrice.value !== '' ||
    maxPrice.value !== ''
  )
})

const getCategoriesDropdownLabel = () => {
  const selected = visibleCategories.value.filter(category =>
    filters.subcategories?.includes(String(category.id)),
  )

  if (!selected.length) return t('All categories')
  if (selected.length === 1) return selected[0].name

  return `${selected.length} ${t('selected')}`
}

const getSortLabel = () => {
  const selected = SORT_OPTIONS.find(option => option.value === filters.sort)
  return selected ? t(selected.label) : t('Sort by price')
}

const ensureListRoute = async () => {
  if (!route.params.productId) return

  await router.replace({
    path: route.path.replace(/\/p\/[^/]+$/, ''),
    query: route.query,
  })
}

const toggleCategory = async categoryId => {
  const id = String(categoryId)
  const current = Array.isArray(filters.subcategories)
    ? [...filters.subcategories]
    : []

  const index = current.indexOf(id)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(id)
  }

  await updateFilters({
    subcategories: current,
    page: 1,
  })
}

const getPerPageLabel = () => {
  return filters.perPage
}

const changePerPage = async value => {
  if (filters.perPage === value) return

  await updateFilters({
    perPage: value,
    page: 1,
  })
}

const toggleCategoryFromDropdown = async categoryId => {
  await ensureListRoute()
  await toggleCategory(categoryId)
}

const toggleSingle = async (key, value) => {
  await updateFilters({
    [key]: filters[key] === value ? (key === 'sort' ? 'desc' : '') : value,
    page: 1,
  })
}

const toggleSortFromDropdown = async value => {
  await ensureListRoute()
  await toggleSingle('sort', value)
}

const submitSearch = async () => {
  const value = searchText.value.trim()

  if (value === (filters.search || '')) return

  await ensureListRoute()

  await updateFilters({
    search: value,
    page: 1,
  })
}

const debouncedPriceChange = debounce(async () => {
  await ensureListRoute()

  await updateFilters({
    page: 1,
  })
}, 500)

const handlePriceRangeChange = () => {
  filters.priceRange.min = minPrice.value ? Number(minPrice.value) : null
  filters.priceRange.max = maxPrice.value ? Number(maxPrice.value) : null

  debouncedPriceChange()
}

const resetAll = async () => {
  debouncedPriceChange.cancel?.()

  await resetFilters()

  searchText.value = ''
  minPrice.value = ''
  maxPrice.value = ''
}

const onPageChange = async page => {
  await updateFilters({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSelectProduct = product => {
  return product
}

watch(
  () => filters.search,
  value => {
    const nextValue = value || ''

    if (nextValue === searchText.value) return

    searchText.value = nextValue
  },
)

watch(
  () => filters.priceRange,
  () => {
    minPrice.value = filters.priceRange?.min ?? ''
    maxPrice.value = filters.priceRange?.max ?? ''
  },
  { deep: true, immediate: true },
)

watch(
  () => currencyStore.currentCurrencyCode,
  async (newCurrency, oldCurrency) => {
    if (!newCurrency || newCurrency === oldCurrency) return

    debouncedPriceChange.cancel?.()

    minPrice.value = ''
    maxPrice.value = ''

    filters.priceRange.min = null
    filters.priceRange.max = null
    filters.page = 1

    console.log('refetch products currency:', oldCurrency, '->', newCurrency)

    await fetchProductsImmediate()
  },
  { flush: 'post' },
)

onMounted(() => {
  initDynamicAdapt('max')
})

onBeforeUnmount(() => {
  debouncedPriceChange.cancel?.()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.products {
  @include adaptiveValue('padding-bottom', 120, 25);
  &__inner {
    @include adaptiveValue('margin-top', -70, -50, 1400, 992, 1);
    @include adaptiveValue('padding-top', 120, 75);
    position: relative;
  }

  &__bg {
    position: absolute;
    width: 100%;
    height: 30%;
    top: 0;
    left: 0;
    @include adaptiveValue('border-radius', 30, 6);
    overflow: hidden;
  }

  &__title {
    position: relative;
    z-index: 1;
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 55, 15);
    }
  }

  &__filters {
    @include adaptiveValue('padding-top', 17, 10);
    @include adaptiveValue('padding-bottom', 17, 10);
    position: relative;
    z-index: 2;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 15);
    }
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, 0px);
      width: 100vw;
      min-width: 320px;
      height: 100%;
      background-color: var(--bg-secondary-color);
      @include adaptiveValue('border-bottom-left-radius', 30, 6);
      @include adaptiveValue('border-bottom-right-radius', 30, 6);
      overflow: hidden;
    }
    &-top {
      display: flex;
      @include adaptiveValue('gap', 24, 20);
      @media (max-width: $md3) {
        flex-wrap: wrap;
        column-gap: 20px;
        row-gap: 15px;
      }
    }
  }

  &__search {
    flex: 0 1 40%;
    :deep(.base-input) {
      min-height: 44px;
    }
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
      order: 1;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
    @media (max-width: $md4) {
      align-self: flex-end;
    }
    &-button {
      text-transform: capitalize !important;
      min-width: 61px !important;
      max-width: 61px !important;
      height: 36px !important;
      max-height: 36px !important;
      font-size: 12px !important;
    }
  }

  &__dropdown {
    flex: 0 1 23%;
    :deep(.base-dropdown__button) {
      min-height: 44px;
    }
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
      order: 3;
      &_sort {
        order: 4;
      }
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__checkbox {
    padding: 5px 10px;
  }

  &__price-range {
    flex: 0 1 17%;
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
      order: 2;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__refresh {
    margin-top: 15px;
    margin-left: auto;
    max-width: 200px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
    position: relative;
    z-index: 1;
  }

  &__loading {
    margin: auto;
  }

  &__empty {
    &-error {
      text-align: center;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    &-button {
      max-width: 300px;
      margin: 0 auto;
    }
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('margin-left', -4, -2);
    @include adaptiveValue('margin-right', -4, -2);
    @include adaptiveValue('row-gap', 8, 4);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 20);
    }
    @media (max-width: $md6) {
      margin-left: -12px;
      margin-right: -12px;
    }
  }

  &__item {
    overflow: hidden;
    @include adaptiveValue('padding-left', 4, 2);
    @include adaptiveValue('padding-right', 4, 2);
    flex: 0 1 14.28%;
    @media (max-width: $md1) {
      flex: 0 1 16.666%;
    }
    @media (max-width: $md2) {
      flex: 0 1 20%;
    }
    @media (max-width: $md3) {
      flex: 0 1 25%;
    }
    @media (max-width: $md4) {
      flex: 0 1 33.333%;
    }
    @media (max-width: $md5) {
      flex: 0 1 50%;
    }
  }

  &__found {
    &-text {
      text-align: center;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    &-button {
      max-width: 300px;
      margin: 0 auto;
    }
  }

  &__bottom {
    display: flex;
    justify-content: center;
  }

  &__pagination {
  }
}
</style>
