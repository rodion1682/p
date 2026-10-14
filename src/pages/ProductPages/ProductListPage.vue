<template>
  <main class="products-page">
    <div class="products-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.jpg" alt="" />
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

    <div class="products-page__top top _cnt">
      <div class="top__decor top__decor_left _ibg-contain">
        <img src="@/assets/img/modal-decor.png" />
      </div>

      <div class="top__decor top__decor_right _ibg-contain">
        <img src="@/assets/img/modal-decor.png" />
      </div>

      <div class="top__switcher">
        <BaseButton
          type="button"
          class="top__switch"
          :variant="isBuyMode ? 'primary' : 'hint-bordered'"
          :aria-pressed="isBuyMode"
          @click="setMarketMode('buy')"
        >
          {{ $t('Buy') }}
        </BaseButton>

        <BaseButton
          type="button"
          class="top__switch"
          :variant="isRentMode ? 'primary' : 'hint-bordered'"
          :aria-pressed="isRentMode"
          @click="setMarketMode('rent')"
        >
          {{ $t('Rent') }}
        </BaseButton>
      </div>

      <div class="top__dropdown">
        <div class="top__dropdown-label">
          {{ $t('Sort:') }}
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
    </div>

    <div class="products-page__inner _cnt">
      <aside
        id="product-filters"
        class="products-page__aside aside"
        :class="{ aside_open: isFiltersOpen }"
        :aria-hidden="isFiltersMobile && !isFiltersOpen"
      >
        <div class="aside__header">
          <div class="aside__title _h4">
            {{ $t('Filters') }}
          </div>

          <button
            type="button"
            class="aside__clear _link"
            @click="resetFilters"
          >
            {{ $t('Clear') }}
          </button>

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
                absolute
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
              <div class="filter-group__top">
                <div class="filter-group__title">
                  {{ $t('Price') }}
                </div>

                <div v-if="false" class="filter-group__info">
                  {{ $t('from') }}
                  {{ minPrice }}
                  {{ $t('to') }}
                  {{ maxPrice }}
                </div>
              </div>

              <div class="filter-group__range price-slider">
                <div class="price-slider__track" />

                <div class="price-slider__progress" :style="priceRangeStyle" />

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

                <span class="filter-group__separator">–</span>

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
            </div>

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
                absolute
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
                absolute
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
                absolute
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

            <BaseButton
              type="button"
              class="aside__submit"
              @click="submitFilters"
            >
              {{ $t('Apply') }}
            </BaseButton>
          </div>
        </div>
      </aside>

      <div class="products-page__content content">
        <div class="content__body">
          <LoadingSpinner
            v-if="loading || !initialized"
            class="content__loader"
          />

          <div v-else-if="error" class="content__empty empty">
            <p class="empty__title _h3">
              {{ $t(error) }}
            </p>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="bordered"
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
            <p class="empty__title _h3">
              {{
                marketMode === 'rent'
                  ? $t('No rental cards found')
                  : $t('No products found')
              }}
            </p>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="bordered"
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
          <div class="pagination__dropdown">
            <div class="pagination__dropdown-label">
              {{ $t('Items per page:') }}
            </div>

            <BaseDropdown
              class="pagination__dropdown-box"
              :label="String(filters.perPage)"
              variant="aside"
              bordered
              absolute
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
.products-page {
  @include adaptiveValue('padding-top', 117, 75);
  @include adaptiveValue('padding-bottom', 32, 25);

  position: relative;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    max-height: 915px;
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__inner {
    @include adaptiveValue('gap', 16, 10, 1840, 1370, 1);

    display: flex;

    width: 100%;
  }

  &__aside {
    min-width: 220px;
    max-width: 220px;
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__filters-toggle {
    position: fixed;
    top: 45%;
    right: 10px;
    z-index: 4;

    display: none;
    align-items: center;
    justify-content: center;

    width: 45px;
    height: 45px;

    padding: 0;

    border: 1px solid var(--border-priamry-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-secondary-color);

    color: var(--hint-secondary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_open {
      border-color: var(--hint-primary-color);
      background: var(--hint-gradient-color);

      color: var(--primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }

      &_open:hover {
        color: var(--bg-primary-color);
      }
    }

    @media (max-width: $md3) {
      display: flex;
    }
  }

  &__filters-toggle-icon {
    display: flex;

    width: 22px;
    height: 22px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__filters-overlay {
    position: fixed;
    inset: 50px 0 0;
    z-index: 3;

    display: none;

    width: 100%;
    height: calc(100dvh - 50px);

    padding: 0;

    border: 0;
    outline: none;
    background-color: rgb(0 0 0 / 72%);

    backdrop-filter: blur(3px);

    @media (max-width: $md3) {
      display: block;
    }
  }

  @media (max-width: $md3) {
    &__inner {
      display: block;
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
      @include adaptiveValue('margin-bottom', 21, 15);
    }

    @media (min-width: $md7) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
  }

  &__filter {
    width: 100% !important;

    @media (min-width: $md7) {
      max-width: 205px;
    }

    @media (max-width: $md7) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__search {
    width: 100%;

    @media (min-width: $md7) {
      max-width: 350px;
    }

    :deep(.base-input__control) {
      @media (any-hover: hover) {
        border: 1px solid transparent;
        background-color: transparent;

        transition:
          border-color 0.3s ease,
          background-color 0.3s ease;

        &::placeholder {
          opacity: 0;

          transition: opacity 0.3s ease;
        }

        &:focus {
          border-color: var(--border-fourth-color);
          background-color: var(--bg-secondary-color);

          &::placeholder {
            opacity: 1;
          }
        }

        &:hover {
          border-color: var(--border-fourth-color);
          background-color: var(--bg-secondary-color);

          &::placeholder {
            opacity: 1;
          }
        }
      }
    }

    &_filled {
      :deep(.base-input__control) {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }

      .content__search-icon {
        color: var(--hint-secondary-color);
      }
    }

    &-icon {
      display: block;

      width: 18px;
      min-width: 18px;
      height: 18px;

      color: var(--third-color);

      pointer-events: none;

      transition: color 0.3s ease;
    }

    &:focus-within {
      .content__search-icon {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__body {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 63, 20);
    }
  }

  &__items {
    @include adaptiveValue('margin-left', -5, -2);
    @include adaptiveValue('margin-right', -5, -2);
    @include adaptiveValue('row-gap', 10, 4);

    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    @include adaptiveValue('padding-left', 5, 2);
    @include adaptiveValue('padding-right', 5, 2);

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
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 0);
    }
  }

  &__reset {
    max-width: 300px;

    margin: 0 auto;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  width: 100%;

  &__pagination {
    width: fit-content;

    margin-left: auto;
  }

  &__dropdown {
    @include adaptiveValue('gap', 16, 10);

    display: flex;
    flex: 0 0 auto;
    align-items: center;

    margin-right: auto;

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

  @media (max-width: $md2) {
    gap: 15px;
  }

  @media (max-width: $md4) {
    flex-direction: column;
    align-items: center;

    &__pagination {
      margin-left: 0;
    }

    &__dropdown {
      justify-content: center;

      margin-right: 0;
    }
  }
}
.dropdown-option {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 40px;

  padding: 10px 12px;

  border: 0;
  border-radius: 4px;
  outline: none;
  background-color: transparent;

  color: var(--secondary-color);
  font-family: var(--font-inter);
  font-size: 14px;
  text-align: left;

  cursor: pointer;

  transition:
    color 0.3s ease,
    background-color 0.3s ease;

  &_selected {
    background-color: var(--hint-third-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:not(&_selected):hover {
      background-color: var(--bg-secondary-color);

      color: var(--hint-secondary-color);
    }
  }
}

.top {
  @include adaptiveValue('padding', 32, 10);
  @include adaptiveValue('gap', 32, 10);

  position: relative;

  display: flex;

  width: 100%;

  border: 1px solid var(--border-sixth-color);
  background-color: var(--bg-fifth-color);
  @media (max-width: $md3) {
    flex-wrap: wrap;
    gap: 10px;
  }
  &__decor {
    @include adaptiveValue('min-width', 58, 38);
    @include adaptiveValue('height', 48, 38);

    position: absolute;
    z-index: 1;

    &_left {
      @include adaptiveValue('left', -6, -8);

      top: -6px;

      transform: rotate(-90deg);
    }

    &_right {
      @include adaptiveValue('right', -6, -8);

      top: -6px;
    }
  }

  &__switcher {
    display: flex;
    @media (max-width: $md3) {
      margin-right: auto;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__switch {
    @media (min-width: $md6) {
      width: fit-content;
      min-width: 93px;
    }
  }

  &__dropdown {
    @include adaptiveValue('gap', 16, 10);

    display: flex;
    align-items: center;
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }

    &-label {
      color: var(--secondary-color);
      font-size: 14px;
      font-weight: 500;
    }

    &-box {
      width: 100%;
      @media (min-width: $md6) {
        min-width: 200px;
        max-width: 220px;
      }
      @media (max-width: $md6) {
        flex: 1 1 100%;
      }
    }
  }

  &__search {
    max-width: 871px;

    margin-left: auto;

    &-icon {
      min-width: 20px;
      height: 20px;

      color: var(--hint-secondary-color) !important;
    }
  }
}

.aside {
  position: relative;
  z-index: 4;

  height: fit-content;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__title {
    font-weight: 500;
    text-transform: none;
  }

  &__close {
    display: none;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    padding: 0;

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-third-color);

    color: var(--hint-primary-color);

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
  }

  &__close-icon {
    display: flex;

    width: 18px;
    height: 18px;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__switcher {
    display: flex;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__switch {
    @include adaptiveValue('min-height', 36, 40);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;

    &_first {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }

    &_last {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }

  &__section {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__submit {
    @include adaptiveValue('min-height', 36, 40);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: $md3) {
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    z-index: 4;

    overflow-x: hidden;
    overflow-y: auto;

    width: min(380px, calc(100vw - 55px));
    min-width: 0;
    max-width: none;
    height: calc(100dvh - 50px);

    padding: 25px 10px;

    border-right: 1px solid var(--border-secondary-color);
    background:
      linear-gradient(rgb(7 8 14 / 96%), rgb(7 8 14 / 99%)),
      var(--bg-primary-color);
    box-shadow: 15px 0 40px rgb(0 0 0 / 50%);
    opacity: 0;

    pointer-events: none;

    transform: translateX(-105%);
    transition:
      transform 0.35s ease,
      opacity 0.3s ease;

    overscroll-behavior: contain;

    &_open {
      opacity: 1;

      pointer-events: auto;

      transform: translateX(0);
    }

    &__header {
      display: grid;
      align-items: center;
      gap: 12px;
      grid-template-columns: minmax(0, 1fr) auto auto;

      padding: 0;
    }

    &__close {
      display: flex;
    }

    &__wrapper {
      padding: 4px;
    }

    &__content {
      padding: 20px 16px;
    }
  }

  @media (max-width: $md5) {
    width: 100%;
    max-width: 500px;

    padding-right: 0px;
    padding-left: 0px;

    &__header {
      grid-template-columns: minmax(0, 1fr) auto;

      padding-right: 10px;
      padding-left: 10px;
    }

    &__clear {
      justify-self: start;
      grid-column: 1 / -1;
      grid-row: 2;
    }

    &__close {
      grid-column: 2;
      grid-row: 1;
    }
  }
}

.filter-group {
  &__top {
    @include adaptiveValue('gap', 24, 20);

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    color: var(--secondary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 8);
    }
  }

  &__info {
    color: var(--secondary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
  }

  &__price {
    @include adaptiveValue('gap', 12, 6);

    display: flex;
    align-items: center;
  }

  &__price-input {
    width: 100%;
    max-width: 50%;
  }

  &__separator {
    color: var(--secondary-color);
    font-size: 16px;
    font-weight: 500;
  }
}

.price-slider {
  position: relative;

  overflow: hidden;

  height: 16px;

  &:not(:last-child) {
    @include adaptiveValue('margin-bottom', 16, 15);
  }

  &__track,
  &__progress {
    position: absolute;
    top: 50%;
    left: 0;

    height: 8px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 2ch;
    background-color: var(--bg-fourth-color);

    pointer-events: none;

    transform: translateY(-50%);
  }

  &__track {
    right: 0;
  }

  &__progress {
    height: 4px;

    background: var(--hint-primary-color);
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 16px;

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
      width: 16px;
      height: 16px;

      margin-top: -6px;

      border: 4px solid var(--hint-primary-color);
      border-radius: 50%;
      background: var(--bg-primary-color);

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
      width: 16px;
      height: 16px;

      border: 3px solid transparent;
      border: 4px solid var(--hint-primary-color);
      border-radius: 50%;
      background: var(--bg-primary-color);

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
</style>
