<template>
  <main class="products-page">
    <div class="products-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <button
      type="button"
      class="products-page__filters-toggle"
      :class="{
        'products-page__filters-toggle_open': isFiltersOpen,
      }"
      :aria-expanded="isFiltersOpen"
      aria-controls="product-filters"
      :aria-label="isFiltersOpen ? $t('Close filters') : $t('Open filters')"
      @click="toggleFilters"
    >
      <SvgIcon
        :icon="isFiltersOpen ? CloseIcon : FilterIcon"
        class="products-page__filters-toggle-icon"
      />
    </button>

    <Transition name="filters-overlay">
      <button
        v-if="isFiltersOpen"
        type="button"
        class="products-page__filters-overlay"
        :aria-label="$t('Close filters')"
        @click="closeFilters"
      />
    </Transition>

    <div class="products-page__inner _cnt">
      <aside
        id="product-filters"
        class="products-page__aside aside"
        :class="{ aside_open: isFiltersOpen }"
        :aria-hidden="isFiltersMobile && !isFiltersOpen"
      >
        <div class="aside__header">
          <div class="aside__title _h6">
            {{ $t('Filters') }}
          </div>

          <button
            type="button"
            class="aside__close"
            :aria-label="$t('Close filters')"
            @click="closeFilters"
          >
            <SvgIcon :icon="CloseIcon" class="aside__close-icon" />
          </button>
        </div>

        <div class="aside__wrapper">
          <div class="aside__content">
            <div class="aside__section filter-group">
              <div class="filter-group__title">
                {{ $t('Heroes') }}
              </div>

              <BaseDropdown
                class="aside__dropdown"
                :label="selectedHeroOption?.label || $t('All')"
                :placeholder="!selectedHeroOption"
                variant="aside"
                bordered
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': filters.hero === '',
                    }"
                    :aria-selected="filters.hero === ''"
                    role="option"
                    @click="selectHero('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in mappedHeroes"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        filters.hero,
                      ),
                    }"
                    :aria-selected="isSelected(option.value, filters.hero)"
                    role="option"
                    @click="selectHero(option.value, close)"
                  >
                    {{ option.label }}
                  </button>
                </template>
              </BaseDropdown>
            </div>
            <div class="aside__section filter-group">
              <div class="filter-group__title">
                {{ $t('Price') }}
              </div>

              <BaseDropdown
                class="aside__dropdown"
                :label="$t('Price')"
                :placeholder="!selectedHeroOption"
                variant="aside"
                bordered
              >
                <div v-if="false" class="filter-group__top">
                  <div class="filter-group__title">
                    {{ $t('Price Range') }}
                  </div>

                  <div v-if="false" class="filter-group__info">
                    {{ $t('from') }}
                    {{ minPrice }}
                    {{ $t('to') }}
                    {{ maxPrice }}
                  </div>
                </div>

                <div v-if="false" class="filter-group__range price-slider">
                  <div class="price-slider__track" />

                  <div
                    class="price-slider__progress"
                    :style="priceRangeStyle"
                  />

                  <input
                    v-model.number="minPrice"
                    class="price-slider__input price-slider__input_min"
                    type="range"
                    :min="PRICE_MIN"
                    :max="PRICE_MAX"
                    :step="PRICE_STEP"
                    :aria-label="$t('Minimum price')"
                    @input="handleMinSliderChange"
                  />

                  <input
                    v-model.number="maxPrice"
                    class="price-slider__input price-slider__input_max"
                    type="range"
                    :min="PRICE_MIN"
                    :max="PRICE_MAX"
                    :step="PRICE_STEP"
                    :aria-label="$t('Maximum price')"
                    @input="handleMaxSliderChange"
                  />
                </div>

                <div class="filter-group__price">
                  <BaseInput
                    v-model="minPrice"
                    class="filter-group__price-input"
                    inputmode="decimal"
                    :placeholder="$t('Min')"
                    @input="handleMinInputChange"
                  >
                    <template #prefix>
                      <PriceFormatter size="size-16" />
                    </template>
                  </BaseInput>

                  <span class="filter-group__separator">-</span>

                  <BaseInput
                    v-model="maxPrice"
                    class="filter-group__price-input"
                    inputmode="decimal"
                    :placeholder="$t('Max')"
                    @input="handleMaxInputChange"
                  >
                    <template #prefix>
                      <PriceFormatter size="size-16" />
                    </template>
                  </BaseInput>
                </div>
              </BaseDropdown>
            </div>
            <div class="aside__section filter-group"></div>

            <div class="aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Rarity') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="selectedRarityOption?.label || $t('All')"
                :placeholder="!selectedRarityOption"
                variant="aside"
                bordered
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': filters.rarity === '',
                    }"
                    :aria-selected="filters.rarity === ''"
                    role="option"
                    @click="selectRarity('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in availableFilters.rarities || []"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        filters.rarity,
                      ),
                    }"
                    :aria-selected="isSelected(option.value, filters.rarity)"
                    role="option"
                    @click="selectRarity(option.value, close)"
                  >
                    {{ option.label }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Card Type') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="selectedTypeOption?.label || $t('All')"
                :placeholder="!selectedTypeOption"
                variant="aside"
                bordered
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': filters.type === '',
                    }"
                    :aria-selected="filters.type === ''"
                    role="option"
                    @click="selectType('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in availableFilters.types || []"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        filters.type,
                      ),
                    }"
                    :aria-selected="isSelected(option.value, filters.type)"
                    role="option"
                    @click="selectType(option.value, close)"
                  >
                    {{ option.label }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Frame Type') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedFrameTypeOption
                    ? formatOptionLabel(selectedFrameTypeOption.label)
                    : $t('All')
                "
                :placeholder="!selectedFrameTypeOption"
                variant="aside"
                bordered
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': filters.frameType === '',
                    }"
                    :aria-selected="filters.frameType === ''"
                    role="option"
                    @click="selectFrameType('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in availableFilters.frameTypes || []"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        filters.frameType,
                      ),
                    }"
                    :aria-selected="isSelected(option.value, filters.frameType)"
                    role="option"
                    @click="selectFrameType(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>
            <div class="aside__bottom">
              <BaseButton
                type="button"
                class="aside__submit"
                variant="clear"
                @click="resetFilters"
              >
                {{ $t('Clear') }}
              </BaseButton>
              <BaseButton
                type="button"
                class="aside__submit"
                @click="submitFilters"
              >
                {{ $t('Apply') }}
              </BaseButton>
            </div>
          </div>
        </div>
        <button
          v-if="false"
          type="button"
          class="aside__clear _link"
          @click="resetFilters"
        >
          {{ $t('Сlear all') }}
        </button>
      </aside>

      <div class="products-page__content content">
        <div class="products-page__top top">
          <div class="top__title _h4">
            {{ $t('Card Store') }}
          </div>
          <div class="top__content">
            <div class="top__switcher">
              <BaseButton
                type="button"
                class="top__switch top__switch_first"
                :variant="isBuyMode ? 'switch-active' : 'switch-inactive'"
                :aria-pressed="isBuyMode"
                @click="setMarketMode('buy')"
              >
                {{ $t('Buy') }}
              </BaseButton>

              <BaseButton
                type="button"
                class="top__switch top__switch_last"
                :variant="isRentMode ? 'switch-active' : 'switch-inactive'"
                :aria-pressed="isRentMode"
                @click="setMarketMode('rent')"
              >
                {{ $t('Rent') }}
              </BaseButton>
            </div>
            <BaseInput
              v-model="filters.search"
              class="top__search"
              :class="{
                content__search_filled: filters.search.trim().length > 0,
              }"
              :placeholder="$t('Search')"
            >
              <template #suffix>
                <SvgIcon :icon="SearchIcon" class="top__search-icon" />
              </template>
            </BaseInput>
            <div class="top__dropdown">
              <div class="top__dropdown-label">
                {{ $t('Sort') }}
              </div>

              <BaseDropdown
                class="top__dropdown-box"
                :label="$t(selectedSortOption?.label || 'Sort by')"
                :placeholder="!selectedSortOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    v-for="option in CATALOG_SORT_OPTIONS"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': option.value === filters.sort,
                    }"
                    :aria-selected="option.value === filters.sort"
                    role="option"
                    @click="selectSort(option.value, close)"
                  >
                    {{ $t(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>
          </div>
        </div>
        <div class="content__body">
          <LoadingSpinner
            v-if="loading || !initialized"
            class="content__loader"
          />

          <div v-else-if="error" class="content__empty empty">
            <p class="empty__title _h4">
              {{ $t(error) }}
            </p>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="clear"
              @click="submitFilters"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <div v-else-if="products.length" class="content__items">
            <div
              v-for="product in products"
              :key="product.id"
              class="content__item"
            >
              <ProductCard
                :product="product"
                type="default"
                :rent="marketMode === 'rent'"
                @open="openProductDetails"
              />
            </div>
          </div>

          <div v-else class="content__empty empty">
            <p class="empty__title _h4">
              {{
                marketMode === 'rent'
                  ? $t('No rental cards found')
                  : $t('No products found')
              }}
            </p>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="clear"
              @click="resetFilters"
            >
              {{ $t('Clear all') }}
            </BaseButton>
          </div>
        </div>

        <div
          v-if="showPaginationControls"
          class="content__pagination pagination"
        >
          <div v-if="false" class="pagination__dropdown">
            <div class="pagination__dropdown-label">
              {{ $t('Items per page:') }}
            </div>

            <BaseDropdown
              class="pagination__dropdown-box"
              :label="String(filters.perPage)"
              variant="aside"
              bordered
            >
              <template #default="{ close }">
                <button
                  v-for="option in ITEMS_PER_PAGE_OPTIONS"
                  :key="option"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      Number(filters.perPage) === Number(option),
                  }"
                  :aria-selected="Number(filters.perPage) === Number(option)"
                  role="option"
                  @click="selectPerPage(option, close)"
                >
                  {{ option }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <PaginationComponent
            v-if="showPagination"
            class="pagination__pagination"
            :total-pages="Math.ceil(pagination.total / filters.perPage)"
            :current-page="Number(filters.page)"
            :is-small="isMobileView"
            @update:current-page="onPageChange"
          />
        </div>
      </div>
    </div>
  </main>

  <ProductDetailsModal
    v-model:show="isProductDetailsOpen"
    :product-id="selectedProductId"
    :rent="selectedProductRent"
    @close="closeProductDetails"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { CloseIcon, SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import ProductCard from '@/components/ProductCard.vue'

import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'

import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'

import ProductDetailsModal from './modals/ProductDetailsModal.vue'

const heroesStore = useHeroesStore()
const navigationStore = useNavigationStore()

const isMobileView = useMediaQuery('(max-width: 767.98px)')
const isFiltersMobile = useMediaQuery('(max-width: 991.98px)')

const FilterIcon = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M7 12H17"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M10 18H14"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <circle
      cx="8"
      cy="6"
      r="2"
      fill="#07080e"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <circle
      cx="15"
      cy="12"
      r="2"
      fill="#07080e"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <circle
      cx="12"
      cy="18"
      r="2"
      fill="#07080e"
      stroke="currentColor"
      stroke-width="1.5"
    />
  </svg>
`

const PRICE_MIN = 0
const PRICE_MAX = 1000
const PRICE_STEP = 1

const minPrice = ref(PRICE_MIN)
const maxPrice = ref(PRICE_MAX)

const {
  CATALOG_SORT_OPTIONS,
  ITEMS_PER_PAGE_OPTIONS,

  marketMode,
  setMarketMode,

  products,
  loading,
  error,
  initialized,

  filters,
  availableFilters,
  pagination,

  updateFilters,
  resetFilters: originalResetFilters,
} = useProductList()

const { isFiltersOpen } = storeToRefs(navigationStore)

const selectedProductId = ref(null)
const selectedProductRent = ref(false)
const isProductDetailsOpen = ref(false)

let searchTimer = null

const openProductDetails = product => {
  if (!product?.id) {
    return
  }

  selectedProductId.value = product.id
  selectedProductRent.value = marketMode.value === 'rent'
  isProductDetailsOpen.value = true
}

const closeProductDetails = () => {
  isProductDetailsOpen.value = false
  selectedProductId.value = null
  selectedProductRent.value = false
}

watch(
  () => filters.search,
  (search, previousSearch) => {
    if (search === previousSearch) {
      return
    }

    window.clearTimeout(searchTimer)

    searchTimer = window.setTimeout(() => {
      updateFilters({
        search,
        page: 1,
      })
    }, 400)
  },
)

watch(isFiltersMobile, isMobile => {
  if (!isMobile) {
    closeFilters()
  }
})

const isBuyMode = computed(() => marketMode.value === 'buy')
const isRentMode = computed(() => marketMode.value === 'rent')

const isSelected = (value, selectedValue) => {
  return String(value) === String(selectedValue)
}

const clampPrice = value => {
  const number = Number(value)

  if (Number.isNaN(number)) {
    return PRICE_MIN
  }

  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, number))
}

const priceRangeStyle = computed(() => {
  const total = PRICE_MAX - PRICE_MIN
  const minPercent = ((Number(minPrice.value) - PRICE_MIN) / total) * 100
  const maxPercent = ((Number(maxPrice.value) - PRICE_MIN) / total) * 100

  return {
    left: `${minPercent}%`,
    width: `${Math.max(0, maxPercent - minPercent)}%`,
  }
})

const updatePriceFilter = () => {
  if (!filters.priceRange) {
    filters.priceRange = {
      min: null,
      max: null,
    }
  }

  const normalizedMin = clampPrice(minPrice.value)
  const normalizedMax = clampPrice(maxPrice.value)

  filters.priceRange.min = normalizedMin === PRICE_MIN ? null : normalizedMin

  filters.priceRange.max = normalizedMax === PRICE_MAX ? null : normalizedMax
}

const handleMinSliderChange = () => {
  const nextMin = clampPrice(minPrice.value)
  const currentMax = clampPrice(maxPrice.value)

  minPrice.value = Math.min(nextMin, currentMax)

  updatePriceFilter()
}

const handleMaxSliderChange = () => {
  const currentMin = clampPrice(minPrice.value)
  const nextMax = clampPrice(maxPrice.value)

  maxPrice.value = Math.max(nextMax, currentMin)

  updatePriceFilter()
}

const handleMinInputChange = () => {
  if (minPrice.value === '') {
    return
  }

  const nextMin = clampPrice(minPrice.value)
  const currentMax = clampPrice(maxPrice.value)

  minPrice.value = Math.min(nextMin, currentMax)

  updatePriceFilter()
}

const handleMaxInputChange = () => {
  if (maxPrice.value === '') {
    return
  }

  const currentMin = clampPrice(minPrice.value)
  const nextMax = clampPrice(maxPrice.value)

  maxPrice.value = Math.max(nextMax, currentMin)

  updatePriceFilter()
}

const mappedHeroes = computed(() =>
  (heroesStore.heroes || []).map(hero => ({
    label: hero.name,
    value: hero.id,
  })),
)

const selectedHeroOption = computed(() =>
  mappedHeroes.value.find(option => isSelected(option.value, filters.hero)),
)

const selectedSortOption = computed(() =>
  CATALOG_SORT_OPTIONS.find(option => option.value === filters.sort),
)

const selectedRarityOption = computed(() =>
  (availableFilters.rarities || []).find(option =>
    isSelected(option.value, filters.rarity),
  ),
)

const selectedTypeOption = computed(() =>
  (availableFilters.types || []).find(option =>
    isSelected(option.value, filters.type),
  ),
)

const selectedFrameTypeOption = computed(() =>
  (availableFilters.frameTypes || []).find(option =>
    isSelected(option.value, filters.frameType),
  ),
)

const showPagination = computed(() => {
  return (
    !loading.value &&
    products.value.length > 0 &&
    pagination.total > filters.perPage
  )
})

const showPaginationControls = computed(() => {
  return !loading.value && initialized.value && products.value.length > 0
})

const formatOptionLabel = value => {
  if (!value) {
    return ''
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const selectHero = (value, close) => {
  filters.hero = value
  close()
}

const selectRarity = (value, close) => {
  filters.rarity = value
  close()
}

const selectType = (value, close) => {
  filters.type = value
  close()
}

const selectFrameType = (value, close) => {
  filters.frameType = value
  close()
}

const selectSort = (value, close) => {
  if (value !== filters.sort) {
    filters.sort = value

    updateFilters({
      sort: value,
      page: 1,
    })
  }

  close()
}

const selectPerPage = (value, close) => {
  const perPage = Number(value)

  if (perPage !== Number(filters.perPage)) {
    updateFilters({
      perPage,
      page: 1,
    })
  }

  close()
}

const openFilters = () => {
  if (!isFiltersMobile.value) {
    return
  }

  navigationStore.openFilters()
}

const closeFilters = () => {
  navigationStore.closeFilters()
}

const toggleFilters = () => {
  if (!isFiltersMobile.value) {
    return
  }

  navigationStore.toggleFilters()
}

const handleFiltersKeydown = event => {
  if (event.key === 'Escape') {
    navigationStore.closeAllDrawers()
  }
}

const submitFilters = () => {
  updatePriceFilter()

  updateFilters({
    rarity: filters.rarity,
    type: filters.type,
    frameType: filters.frameType,
    hero: filters.hero,
    priceRange: {
      ...filters.priceRange,
    },
    page: 1,
  })

  closeFilters()
}

const resetFilters = () => {
  originalResetFilters()

  minPrice.value = PRICE_MIN
  maxPrice.value = PRICE_MAX

  closeFilters()
}

const onPageChange = page => {
  updateFilters({ page })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  minPrice.value = filters.priceRange?.min ?? PRICE_MIN
  maxPrice.value = filters.priceRange?.max ?? PRICE_MAX

  window.addEventListener('keydown', handleFiltersKeydown)
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
  window.removeEventListener('keydown', handleFiltersKeydown)
})
</script>

<style lang="scss" scoped>
.filters-overlay-enter-active,
.filters-overlay-leave-active {
  transition:
    opacity 0.3s ease,
    backdrop-filter 0.3s ease;
}

.filters-overlay-enter-from,
.filters-overlay-leave-to {
  opacity: 0;

  backdrop-filter: blur(0);
}

:global(body.filters-drawer-open) {
  @media (max-width: $md3) {
    overflow: hidden;
  }
}


.aside {
  position: relative;

  height: fit-content;
  @media (max-width: $md3) {
    position: fixed;
    top: 51px;
    bottom: 0;
    left: 0;
    z-index: 4;

    overflow-x: hidden;
    overflow-y: auto;

    width: 320px;
    min-width: 0;
    max-width: none;
    height: calc(100dvh - 51px);

    padding: 30px 10px;

    border-right: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fourth-color);
    opacity: 0;

    pointer-events: none;

    transform: translateX(-105%);
    transition: all 0.3s ease 0s;

    overscroll-behavior: contain;

    &_open {
      opacity: 1;

      pointer-events: auto;

      transform: translateX(0);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
    @media (max-width: $md3) {
      display: grid;
      align-items: center;
      gap: 12px;
      grid-template-columns: minmax(0, 1fr) auto auto;

      padding: 0;
    }
    @media (max-width: $md5) {
      grid-template-columns: minmax(0, 1fr) auto;

      padding-right: 10px;
      padding-left: 10px;
    }
  }

  &__title {
    font-weight: 500;
    line-height: 120%;
    text-transform: none;
  }

  &__close {
    display: none;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    padding: 0;

    border: 1px solid var(--border-secondary-color);
    border-radius: 8px;
    outline: none;
    background-color: var(--third-color);

    color: var(--primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
    @media (max-width: $md3) {
      display: flex;
    }
    &-icon {
      width: 20px;
      height: 20px;
    }
  }

  &__wrapper {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__content {
  }

  &__section {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }
  &__dropdown {
  }

  &__submit {
  }

  &__clear {
    width: fit-content;
    @media (max-width: $md3) {
      display: flex;
      justify-content: flex-end;

      margin-left: auto;
    }
  }
}

.filter-group {
  &__title {
    color: var(--seventh-color);
    font-size: 16px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: 0px;
    &::after {
      content: ':';
    }
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__range {
  }

  &__price {
    display: flex;
    align-items: center;
    gap: 8px;
    &-input {
      width: 100%;
      max-width: 50%;
    }
  }

  &__separator {
    color: var(--secondary-color);
    font-size: 16px;
    font-weight: 500;
  }

  &__dropdown {
  }
}

.price-slider {
  position: relative;

  overflow: hidden;

  height: 17px;
  &:not(:last-child) {
    margin-bottom: 16px;
  }

  &__track,
  &__progress {
    position: absolute;
    top: 50%;
    left: 0;

    height: 7px;

    border: 1px solid var(--border-third-color);
    border-radius: 4px;
    background-color: var(--bg-fourth-color);

    pointer-events: none;

    transform: translateY(-50%);
  }

  &__track {
    right: 0;
  }

  &__progress {
    height: 4px;

    background: var(--third-color);
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 17px;

    margin: 0;

    outline: none;
    background: transparent;

    appearance: none;
    pointer-events: none;

    &::-webkit-slider-runnable-track {
      height: 4px;

      background: transparent;
    }

    &::-webkit-slider-thumb {
      position: relative;
      z-index: 2;

      box-sizing: border-box;
      width: 17px;
      height: 17px;

      margin-top: -6.5px;

      border: 4px solid var(--primary-color);
      border-radius: 50%;
      background: linear-gradient(0deg, #999999 0%, #ffffff 100%);

      appearance: none;
      cursor: grab;
      pointer-events: auto;

      &:active {
        cursor: grabbing;
      }
    }

    &::-moz-range-track {
      height: 4px;

      border: 0;
      background: transparent;
    }

    &::-moz-range-thumb {
      box-sizing: border-box;
      width: 17px;
      height: 17px;

      border: 3px solid transparent;
      border: 4px solid var(--secondary-color);
      border-radius: 50%;
      background: linear-gradient(0deg, #999999 0%, #ffffff 100%);

      cursor: grab;
      pointer-events: auto;
    }

    &_min {
      z-index: 2;
    }

    &_max {
      z-index: 3;
    }
  }
}

.content {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  min-width: 0;

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__body {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 20);
    }
  }

  &__items {
    @include adaptiveValue('margin-left', -8, -2);
    @include adaptiveValue('margin-right', -8, -2);
    @include adaptiveValue('row-gap', 16, 4);

    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    @include adaptiveValue('padding-left', 8, 2);
    @include adaptiveValue('padding-right', 8, 2);

    flex: 0 1 14.285%;

    @media (max-width: $md1) {
      flex-basis: 16.666%;
    }

    @media (max-width: 1499.98px) {
      flex-basis: 20%;
    }

    @media (max-width: $md2) {
      flex-basis: 25%;
    }

    @media (max-width: 1099.98px) {
      flex-basis: 33.333%;
    }

    @media (max-width: $md4) {
      flex-basis: 50%;
    }

    @media (max-width: $md6) {
      flex-basis: 100%;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    margin: auto;
  }
}

.empty {
  text-align: center;

  &__title {
    position: relative;
    z-index: 1;

    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__reset {
    max-width: 300px;

    margin: 0 auto;
  }
}

.pagination {
  position: relative;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  width: 100%;
  @media (max-width: $md5) {
    display: block;
  }
  &__pagination {
    width: fit-content;

    margin-left: auto;
    @media (max-width: $md5) {
      display: flex !important;
      flex: 1 1 100% !important;

      margin-right: auto;
    }
  }

  &__dropdown {
    @include adaptiveValue('gap', 16, 10);

    display: flex;
    flex: 0 0 auto;
    align-items: center;

    margin-right: auto;
    @media (max-width: $md5) {
      justify-content: center;

      margin-left: auto;
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
    &-label {
      color: var(--secondary-color);
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }

    &-box {
      width: 100%;
      min-width: 80px;
      max-width: 100px;
    }
  }
}

//========================================================================================================================================================

.products-page {
  @include adaptiveValue('padding-top', 130, 80);
  @include adaptiveValue('padding-bottom', 54, 30);
  position: relative;
  &__bg {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    aspect-ratio: 1 / 0.54;
  }
  &__filters-toggle {
    position: fixed;
    top: 45%;
    right: 10px;
    z-index: 2;

    display: none;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    padding: 0;

    border: 1px solid inherit;
    border-radius: 6px;
    outline: none;
    background-color: var(--bg-primary-color);

    color: var(--fifth-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &_open {
      color: var(--hint-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }

      &_open:hover {
        color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md3) {
      display: flex;
    }
    &-icon {
      display: flex;

      width: 20px;
      height: 20px;

      color: inherit;

      :deep(svg) {
        display: block;

        width: 100%;
        height: 100%;
      }
    }
  }
  &__filters-overlay {
    position: fixed;
    inset: 51px 0 0;
    z-index: 3;

    display: none;

    width: 100%;
    height: calc(100dvh - 51px);

    padding: 0;

    border: 0;
    outline: none;
    background-color: rgb(0, 0, 0, 0.5);

    -webkit-backdrop-filter: blur(64px);
    backdrop-filter: blur(64px);
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 18);
    }
  }

  &__inner {
    @include adaptiveValue('gap', 42, 10, 1800, 1370, 1);
    display: flex;

    width: 100%;
    @media (max-width: $md3) {
      display: block;
    }
  }

  &__aside {
    @include adaptiveValue('min-width', 353, 250, 1800, 1370, 1);
    @include adaptiveValue('max-width', 353, 250, 1800, 1370, 1);
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }
}

.top {
  position: relative;
  z-index: 1;
  &__title {
    width: fit-content;

    margin-right: auto;

    color: var(--fourth-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 18);
    }
  }

  &__content {
    @include adaptiveValue('padding', 18, 10);
    @include adaptiveValue('border-radius', 12, 10);
    position: relative;

    display: flex;
    align-items: center;
    gap: 18px;

    background: linear-gradient(180deg, #111624 0%, #111624 100%);
  }

  &__switcher {
    display: flex;
    gap: 6px;
  }

  &__switch {
    min-width: 80px;

    // &_first {
    //   border-bottom-right-radius: 0;
    //   border-top-right-radius: 0;
    // }

    // &_last {
    //   border-bottom-left-radius: 0;
    //   border-top-left-radius: 0;
    // }
  }

  &__search {
    width: 100%;
    min-width: 0;
    max-width: 539px;

    margin: 0 auto;

    &-icon {
      min-width: 32px;
      height: 32px;

      color: var(--fourth-color);
    }
  }

  &__dropdown {
    &-label {
      @include hide-item;
    }

    &-box {
      flex: 1 1 auto;

      width: 100%;
      min-width: 0;
      max-width: 230px;
    }
  }
}

.dropdown-option {
  &_selected {
  }
}

.aside {
  &_open {
  }

  &__header {
  }

  &__title {
  }

  &__close {
    &-icon {
    }
  }

  &__wrapper {
  }

  &__content {
  }

  &__section {
  }

  &__dropdown {
  }

  &__bottom {
  }

  &__submit {
  }
}

.filter-group {
  &__title {
  }

  &__price {
    &-input {
    }
  }

  &__separator {
  }

  &__dropdown {
  }
}

.content {
  &__body {
  }

  &__loader {
  }

  &__empty {
  }

  &__items {
  }

  &__item {
  }

  &__pagination {
  }
}

.empty {
  &__title {
  }

  &__reset {
  }
}

.pagination {
  &__pagination {
  }
}
</style>
