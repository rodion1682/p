<template>
  <main class="collection-page">
    <div class="collection-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <button
      type="button"
      class="collection-page__filters-toggle"
      :class="{ 'collection-page__filters-toggle_open': isFiltersOpen }"
      :aria-expanded="isFiltersOpen"
      aria-controls="collection-filters"
      :aria-label="isFiltersOpen ? $t('Close filters') : $t('Open filters')"
      @click="toggleFilters"
    >
      <SvgIcon
        :icon="isFiltersOpen ? CloseIcon : FilterIcon"
        class="collection-page__filters-toggle-icon"
      />
    </button>

    <Transition name="filters-overlay">
      <button
        v-if="isFiltersOpen && isFiltersMobile"
        type="button"
        class="collection-page__filters-overlay"
        :aria-label="$t('Close filters')"
        @click="closeFilters"
      />
    </Transition>

    <div class="collection-page__top top _cnt">
      <div class="top__decor _ibg-contain" aria-hidden="true">
        <img src="@/assets/img/product-list-decor.png" alt="" />
      </div>

      <div class="top__controls">
        <div class="top__switcher">
          <BaseButton
            type="button"
            class="top__switch top__switch_first"
            :variant="!isRentedCollection ? 'primary' : 'hint-bordered'"
            :aria-pressed="!isRentedCollection"
            @click="setCollectionMode('bought')"
          >
            {{ $t('Bought') }}
          </BaseButton>

          <BaseButton
            type="button"
            class="top__switch top__switch_last"
            :variant="isRentedCollection ? 'primary' : 'hint-bordered'"
            :aria-pressed="isRentedCollection"
            @click="setCollectionMode('rented')"
          >
            {{ $t('Rented') }}
          </BaseButton>
        </div>

        <div class="top__dropdown">
          <div class="top__dropdown-label">{{ $t('Sort') }}:</div>

          <BaseDropdown
            class="top__dropdown-box"
            :label="$t(selectedSortOption?.label || 'All')"
            variant="aside"
            bordered
            absolute
          >
            <template #default="{ close }">
              <button
                v-for="option in COLLECTION_SORT_OPTIONS"
                :key="option.value"
                type="button"
                class="dropdown-option"
                :class="{
                  'dropdown-option_selected': filters.sort === option.value,
                }"
                @click="selectSort(option.value, close)"
              >
                {{ $t(option.label) }}
              </button>
            </template>
          </BaseDropdown>
        </div>
      </div>

      <h1 class="top__title _h5">
        {{ $t('My Card') }}
      </h1>

      <BaseInput
        v-model="collectionFilters.search"
        class="top__search"
        :placeholder="$t('Search')"
      >
        <template #suffix>
          <SvgIcon :icon="SearchIcon" class="top__search-icon" />
        </template>
      </BaseInput>
    </div>

    <div class="collection-page__inner _cnt">
      <aside
        id="collection-filters"
        class="collection-page__aside aside"
        :class="{ aside_open: isFiltersOpen }"
        :aria-hidden="isFiltersMobile && !isFiltersOpen"
      >
        <div class="aside__header">
          <h2 class="aside__title _h6">
            {{ $t('Filter') }}
          </h2>

          <button
            type="button"
            class="aside__close"
            :aria-label="$t('Close filters')"
            @click="closeFilters"
          >
            <SvgIcon :icon="CloseIcon" class="aside__close-icon" />
          </button>
        </div>

        <div class="aside__body">
          <div class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Heroes') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="selectedHeroOption?.label || $t('All')"
              variant="aside"
              bordered
              absolute
            >
              <template #default="{ close }">
                <button
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': !collectionFilters.hero,
                  }"
                  @click="selectFilter('hero', '', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in heroOptions"
                  :key="option.value"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      String(collectionFilters.hero) === String(option.value),
                  }"
                  @click="selectFilter('hero', option.value, close)"
                >
                  {{ option.label }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Rarity') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="selectedRarityOption?.label || $t('All')"
              variant="aside"
              bordered
              absolute
            >
              <template #default="{ close }">
                <button
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': !collectionFilters.rarity,
                  }"
                  @click="selectFilter('rarity', '', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in rarityOptions"
                  :key="option.value"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      String(collectionFilters.rarity) === String(option.value),
                  }"
                  @click="selectFilter('rarity', option.value, close)"
                >
                  {{ option.label }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Card Type') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="selectedTypeOption?.label || $t('All')"
              variant="aside"
              bordered
              absolute
            >
              <template #default="{ close }">
                <button
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': !collectionFilters.type,
                  }"
                  @click="selectFilter('type', '', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in typeOptions"
                  :key="option.value"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      String(collectionFilters.type) === String(option.value),
                  }"
                  @click="selectFilter('type', option.value, close)"
                >
                  {{ option.label }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Frame Type') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="selectedFrameOption?.label || $t('All')"
              variant="aside"
              bordered
              absolute
            >
              <template #default="{ close }">
                <button
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': !collectionFilters.frameType,
                  }"
                  @click="selectFilter('frameType', '', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in frameOptions"
                  :key="option.value"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      String(collectionFilters.frameType) ===
                      String(option.value),
                  }"
                  @click="selectFilter('frameType', option.value, close)"
                >
                  {{ option.label }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div v-if="isRentedCollection" class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Rental Status') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="selectedRentalStatusOption?.label || $t('All')"
              variant="aside"
              bordered
              absolute
            >
              <template #default="{ close }">
                <button
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': !filters.rentalStatus,
                  }"
                  @click="selectRentalStatus('', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in rentalStatusOptions"
                  :key="option.value"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      filters.rentalStatus === option.value,
                  }"
                  @click="selectRentalStatus(option.value, close)"
                >
                  {{ $t(option.label) }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <BaseButton
            type="button"
            class="aside__submit"
            variant="hint-bordered"
            @click="applyFilters"
          >
            {{ $t('Apply') }}
          </BaseButton>

          <button type="button" class="aside__clear" @click="resetFilters">
            {{ $t('Clear all') }}
          </button>
        </div>
      </aside>

      <div class="collection-page__content content">
        <div class="content__body">
          <div v-if="loading" class="content__loader">
            {{ $t('Loading') }}...
          </div>

          <div v-else-if="error" class="content__empty empty">
            <h2 class="empty__title _h5">
              {{ $t('Unable to load cards') }}
            </h2>

            <p class="empty__description">
              {{ error }}
            </p>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="hint-bordered"
              @click="reloadCards"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <div v-else-if="visibleProducts.length" class="content__items">
            <div
              v-for="product in visibleProducts"
              :key="getProductKey(product)"
              class="content__item"
            >
              <MyProductCard
                class="content__card"
                :product="product"
                :rented="isRentedCollection"
                @click="openProduct(product)"
              />
            </div>
          </div>

          <div v-else class="content__empty empty">
            <h2 class="empty__title _h5">
              {{ $t('No cards found') }}
            </h2>

            <p class="empty__description">
              {{
                hasLocalFilters
                  ? $t('Try changing or clearing your filters.')
                  : isRentedCollection
                    ? $t('You do not have any rented cards yet.')
                    : $t('You do not have any bought cards yet.')
              }}
            </p>

            <BaseButton
              v-if="hasLocalFilters"
              type="button"
              class="empty__reset"
              variant="hint-bordered"
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
                  :key="option.value ?? option"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected':
                      Number(filters.perPage) ===
                      Number(option.value ?? option),
                  }"
                  @click="selectPerPage(option.value ?? option, close)"
                >
                  {{ option.label ?? option.value ?? option }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <PaginationComponent
            v-if="showPagination"
            class="pagination__pagination"
            :total-pages="totalPages"
            :current-page="Number(filters.page)"
            :is-small="isMobileView"
            @update:current-page="onPageChange"
          />
        </div>
      </div>
    </div>

    <MyCardDetailsModal
      v-model:show="isProductDetailsOpen"
      :product-id="selectedProductId"
      :collection-item="selectedCollectionItem"
      :rented="isRentedCollection"
      @close="closeProduct"
      @sold="handleCardSold"
    />
  </main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { CloseIcon, SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'

import MyProductCard from './components/MyProductCard.vue'
import MyCardDetailsModal from './modals/MyCardDetailsModal.vue'

const FilterIcon = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20M7 12H17M10 18H14"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
`

const navigationStore = useNavigationStore()
const heroesStore = useHeroesStore()

const isMobileView = useMediaQuery('(max-width: 767.98px)')
const isFiltersMobile = useMediaQuery('(max-width: 991.98px)')

const { isFiltersOpen } = storeToRefs(navigationStore)

const {
  COLLECTION_SORT_OPTIONS,
  ITEMS_PER_PAGE_OPTIONS,
  collectionMode,
  isRentedCollection,
  collectionProducts,
  loading,
  error,
  filters,
  availableFilters,
  pagination,
  updateFilters,
  resetFilters: resetStoreFilters,
  fetchCollectionProducts,
} = useProductList()

const collectionFilters = reactive({
  search: '',
  hero: '',
  rarity: '',
  type: '',
  frameType: '',
})

const appliedFilters = reactive({
  hero: '',
  rarity: '',
  type: '',
  frameType: '',
})

const selectedProductId = ref(null)
const selectedCollectionItem = ref(null)
const isProductDetailsOpen = ref(false)

const normalize = value =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const getCard = product =>
  product?.card ??
  product?.product?.card ??
  product?.product ??
  product?.item?.card ??
  product?.item ??
  product ??
  {}

const getCardId = product => {
  if (isRentedCollection.value) {
    return (
      product?.card_id ??
      product?.card?.id ??
      product?.product?.card_id ??
      product?.product?.card?.id ??
      product?.item?.card_id ??
      null
    )
  }

  const card = getCard(product)

  return (
    card?.id ??
    product?.card_id ??
    product?.product_id ??
    product?.item_id ??
    product?.id ??
    null
  )
}

const getProductKey = product => {
  if (isRentedCollection.value) {
    return (
      product?.rental_id ??
      product?.id ??
      `${getCardId(product)}-${product?.rental_period_id ?? 'rental'}`
    )
  }

  return (
    product?.instance_uuid ??
    product?.card_instance_id ??
    product?.id ??
    `owned-${getCardId(product)}`
  )
}

const normalizeOptions = source => {
  const values = Array.isArray(source) ? source : Object.values(source ?? {})

  return values
    .map(option => {
      if (option && typeof option === 'object') {
        return {
          value: option.value ?? option.id ?? option.slug ?? option.name,
          label: String(
            option.label ??
              option.name ??
              option.title ??
              option.value ??
              option.id ??
              '',
          ),
        }
      }

      return {
        value: option,
        label: String(option ?? ''),
      }
    })
    .filter(option => option.value !== undefined && option.value !== null)
}

const heroOptions = computed(() =>
  normalizeOptions(availableFilters.value?.heroes ?? heroesStore.heroes ?? []),
)

const rarityOptions = computed(() =>
  normalizeOptions(availableFilters.value?.rarities ?? []),
)

const typeOptions = computed(() =>
  normalizeOptions(
    availableFilters.value?.types ?? availableFilters.value?.card_types ?? [],
  ),
)

const frameOptions = computed(() =>
  normalizeOptions(
    availableFilters.value?.frame_types ?? availableFilters.value?.frames ?? [],
  ),
)

const rentalStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
]

const findOption = (options, value) =>
  options.find(option => normalize(option.value) === normalize(value))

const selectedSortOption = computed(() =>
  COLLECTION_SORT_OPTIONS.find(
    option => normalize(option.value) === normalize(filters.sort),
  ),
)

const selectedHeroOption = computed(() =>
  findOption(heroOptions.value, collectionFilters.hero),
)

const selectedRarityOption = computed(() =>
  findOption(rarityOptions.value, collectionFilters.rarity),
)

const selectedTypeOption = computed(() =>
  findOption(typeOptions.value, collectionFilters.type),
)

const selectedFrameOption = computed(() =>
  findOption(frameOptions.value, collectionFilters.frameType),
)

const selectedRentalStatusOption = computed(() =>
  findOption(rentalStatusOptions, filters.rentalStatus),
)

const hasLocalFilters = computed(() =>
  Boolean(
    collectionFilters.search.trim() ||
    appliedFilters.hero ||
    appliedFilters.rarity ||
    appliedFilters.type ||
    appliedFilters.frameType,
  ),
)

const matchesFilter = (actual, expected) => {
  if (!expected) return true

  if (actual && typeof actual === 'object') {
    return [actual.id, actual.value, actual.slug, actual.name].some(
      value => normalize(value) === normalize(expected),
    )
  }

  return normalize(actual) === normalize(expected)
}

const visibleProducts = computed(() => {
  const search = normalize(collectionFilters.search)

  return (collectionProducts.value ?? []).filter(product => {
    const card = getCard(product)

    const title =
      card?.name ?? card?.title ?? product?.name ?? product?.title ?? ''

    if (search && !normalize(title).includes(search)) {
      return false
    }

    if (
      !matchesFilter(
        card?.hero_id ?? card?.hero ?? product?.hero_id,
        appliedFilters.hero,
      )
    ) {
      return false
    }

    if (
      !matchesFilter(
        card?.rarity ?? card?.rarity_id ?? product?.rarity,
        appliedFilters.rarity,
      )
    ) {
      return false
    }

    if (
      !matchesFilter(
        card?.type ?? card?.card_type ?? product?.type,
        appliedFilters.type,
      )
    ) {
      return false
    }

    if (
      !matchesFilter(
        card?.frame_type ?? card?.frameType ?? product?.frame_type,
        appliedFilters.frameType,
      )
    ) {
      return false
    }

    return true
  })
})

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      Number(pagination.value?.total ?? 0) /
        Math.max(1, Number(filters.perPage ?? 21)),
    ),
  ),
)

const showPagination = computed(() => totalPages.value > 1)

const showPaginationControls = computed(
  () =>
    !loading.value && !error.value && Number(pagination.value?.total ?? 0) > 0,
)

const closeFilters = () => {
  navigationStore.closeFilters()
}

const toggleFilters = () => {
  if (!isFiltersMobile.value) return

  navigationStore.toggleFilters()
}

const selectFilter = (key, value, close) => {
  collectionFilters[key] = value
  close?.()
}

const selectSort = async (value, close) => {
  close?.()

  await updateFilters({
    sort: value,
    page: 1,
  })
}

const selectRentalStatus = async (value, close) => {
  close?.()

  await updateFilters({
    rentalStatus: value,
    page: 1,
  })
}

const selectPerPage = async (value, close) => {
  close?.()

  await updateFilters({
    perPage: Number(value),
    page: 1,
  })
}

const onPageChange = async page => {
  await updateFilters({
    page: Number(page),
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const applyFilters = () => {
  Object.assign(appliedFilters, {
    hero: collectionFilters.hero,
    rarity: collectionFilters.rarity,
    type: collectionFilters.type,
    frameType: collectionFilters.frameType,
  })

  closeFilters()
}

const clearLocalFilters = () => {
  Object.assign(collectionFilters, {
    search: '',
    hero: '',
    rarity: '',
    type: '',
    frameType: '',
  })

  Object.assign(appliedFilters, {
    hero: '',
    rarity: '',
    type: '',
    frameType: '',
  })
}

const resetFilters = async () => {
  clearLocalFilters()
  await resetStoreFilters()
  closeFilters()
}

const setCollectionMode = async mode => {
  if (collectionMode.value === mode) return

  collectionMode.value = mode
  clearLocalFilters()
  closeFilters()

  await updateFilters({ page: 1 })
  await fetchCollectionProducts({ debounced: false })
}

const reloadCards = async () => {
  await fetchCollectionProducts({ debounced: false })
}

const openProduct = product => {
  const cardId = getCardId(product)

  if (!cardId) return

  selectedCollectionItem.value = product
  selectedProductId.value = cardId
  isProductDetailsOpen.value = true
}

const closeProduct = () => {
  isProductDetailsOpen.value = false
  selectedProductId.value = null
  selectedCollectionItem.value = null
}

const handleCardSold = async () => {
  closeProduct()
  await fetchCollectionProducts({ debounced: false })
}

watch(isFiltersMobile, isMobile => {
  if (!isMobile) closeFilters()
})

watch(collectionMode, () => {
  clearLocalFilters()
  closeProduct()
  closeFilters()
})

onBeforeUnmount(() => {
  closeFilters()
})
</script>

<style lang="scss" scoped>
.filters-overlay-enter-active,
.filters-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.filters-overlay-enter-from,
.filters-overlay-leave-to {
  opacity: 0;
}

.collection-page {
  @include adaptiveValue('padding-top', 120, 80);
  @include adaptiveValue('padding-bottom', 46, 30);

  position: relative;

  min-height: 100vh;

  &__bg {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    aspect-ratio: 1 / 0.315;

    pointer-events: none;
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__inner {
    @include adaptiveValue('gap', 16, 10, 1870, 1370, 1);

    position: relative;

    display: flex;
    align-items: flex-start;

    width: 100%;
  }

  &__aside {
    flex: 0 0 220px;

    width: 220px;
    min-width: 220px;
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__filters-toggle {
    position: fixed;
    top: 45%;
    right: 10px;
    z-index: 120;

    display: none;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    padding: 0;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background-color: #29234d;

    color: var(--secondary-color);

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    &_open {
      border-color: var(--border-priamry-color);
      background-color: var(--third-color);
    }

    &-icon {
      display: flex;

      width: 20px;
      height: 20px;

      color: inherit;
    }
  }

  &__filters-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;

    display: none;

    width: 100%;
    height: 100%;

    padding: 0;

    border: 0;
    background-color: rgb(0 0 0 / 60%);

    cursor: pointer;

    backdrop-filter: blur(4px);
  }

  @media (max-width: $md3) {
    &__inner {
      display: block;
    }

    &__filters-toggle {
      display: flex;
    }

    &__filters-overlay {
      display: block;
    }

    &__aside {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 110;

      visibility: hidden;
      overflow-y: auto;

      width: min(340px, 90vw);
      min-width: 0;
      height: 100dvh;

      padding: 30px 20px;

      border-right: 1px solid var(--border-fourth-color);
      background-color: #191538;
      box-shadow: 12px 0 40px rgb(0 0 0 / 30%);
      opacity: 0;

      pointer-events: none;

      transform: translateX(-105%);
      transition:
        transform 0.3s ease,
        opacity 0.3s ease,
        visibility 0.3s ease;

      overscroll-behavior: contain;

      &.aside_open {
        visibility: visible;

        opacity: 1;

        pointer-events: auto;

        transform: translateX(0);
      }
    }

    &__content {
      width: 100%;
    }
  }

  @media (max-width: $md5) {
    &__aside {
      padding: 25px 16px;
    }
  }
}

.top {
  @include adaptiveValue('padding', 24, 10);
  @include adaptiveValue('gap', 30, 10);

  position: relative;

  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);

  width: 100%;

  border: 1px solid var(--border-fourth-color);
  border-radius: 12px;
  background-color: var(--bg-nineth-color);

  &__decor {
    @include adaptiveValue('width', 338, 138);

    position: absolute;
    top: 0;
    left: 50%;

    aspect-ratio: 1 / 0.11;

    pointer-events: none;

    transform: translate(-50%, -100%);
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 16px;
    grid-column: 1;
    grid-row: 1;

    min-width: 0;
  }

  &__switcher {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
  }

  &__switch {
    min-width: 88px;

    &_first {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }

    &_last {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }

  &__dropdown {
    @include adaptiveValue('gap', 16, 10);

    display: flex;
    flex: 0 1 auto;
    align-items: center;

    min-width: 0;

    &-label {
      flex: 0 0 auto;

      color: var(--seventh-color);
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
    }

    &-box {
      flex: 1 1 auto;

      width: 100%;
      min-width: 0;
      max-width: 258px;
    }
  }

  &__title {
    justify-self: center;
    grid-column: 2;
    grid-row: 1;

    margin: 0;

    color: var(--secondary-color);
    font-weight: 500;
    line-height: 120%;
    text-align: center;
    white-space: nowrap;
  }

  &__search {
    justify-self: end;
    grid-column: 3;
    grid-row: 1;

    width: 100%;
    min-width: 0;
    max-width: 659px;

    margin: 0;

    &-icon {
      width: 20px;
      height: 20px;

      opacity: 0.5;

      color: var(--secondary-color);
    }
  }

  @media (max-width: 1199.98px) {
    gap: 20px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &__title {
      grid-column: 1 / -1;
      grid-row: 1;
    }

    &__controls {
      flex-wrap: wrap;
      gap: 12px;
      grid-column: 1;
      grid-row: 2;
    }

    &__dropdown {
      flex: 1 1 auto;
    }

    &__search {
      grid-column: 2;
      grid-row: 2;
    }
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(0, 1fr);

    &__title {
      grid-column: 1;
      grid-row: 1;
    }

    &__controls {
      grid-column: 1;
      grid-row: 2;

      width: 100%;
    }

    &__search {
      grid-column: 1;
      grid-row: 3;

      width: 100%;
      max-width: none;
    }
  }

  @media (max-width: $md4) {
    gap: 15px;

    &__dropdown {
      flex: 1 1 100%;

      &-box {
        max-width: none;
      }
    }
  }

  @media (max-width: $md7) {
    &__controls {
      flex-direction: column;
      align-items: stretch;
    }

    &__switcher {
      justify-content: center;
    }

    &__dropdown {
      width: 100%;
    }
  }
}

.aside {
  display: flex;
  flex-direction: column;

  min-width: 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 16);
    }
  }

  &__title {
    margin: 0;

    color: var(--secondary-color);
    font-weight: 500;
    line-height: 120%;
  }

  &__close {
    display: none;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--secondary-color);

    cursor: pointer;

    @media (max-width: $md3) {
      display: flex;
    }

    &-icon {
      width: 20px;
      height: 20px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;

    width: 100%;
  }

  &__section {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 16);
    }
  }

  &__submit {
    width: 100%;

    margin-top: 2px;
  }

  &__clear {
    width: fit-content;

    margin-top: 20px;
    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fifth-color);
    font-size: 14px;

    cursor: pointer;

    @media (any-hover: hover) {
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;

  width: 100%;
  min-width: 0;

  &__title {
    margin: 0;

    color: var(--seventh-color);
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;
  }

  &__dropdown {
    width: 100%;
    min-width: 0;
  }
}

.content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  min-width: 0;

  &__body {
    display: flex;
    flex: 1 1 auto;
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

    min-width: 0;

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

  &__card {
    width: 100%;
    height: 100%;
  }

  &__loader {
    align-self: center;

    margin: auto;
    padding: 50px 0;

    color: var(--secondary-color);
  }

  &__empty {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 300px;

    margin: auto;

    text-align: center;
  }

  &__pagination {
    width: 100%;
  }
}

.empty {
  &__title {
    margin: 0 0 16px;

    color: var(--secondary-color);
  }

  &__description {
    margin: 0 0 20px;

    color: var(--seventh-color);
    line-height: 150%;
  }

  &__reset {
    min-width: 160px;
    max-width: 300px;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  width: 100%;

  &__dropdown {
    display: flex;
    align-items: center;
    gap: 16px;

    min-width: 0;

    &-label {
      color: var(--seventh-color);
      font-size: 14px;
      white-space: nowrap;
    }

    &-box {
      min-width: 70px;
    }
  }

  &__pagination {
    margin-left: auto;
  }

  @media (max-width: $md4) {
    flex-direction: column;
    align-items: center;
    gap: 16px;

    &__pagination {
      margin-left: 0;
    }
  }
}

.dropdown-option {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 38px;

  padding: 10px 14px;

  border: 0;
  border-radius: 5px;
  background: transparent;

  color: var(--secondary-color);
  font-size: 14px;
  text-align: left;

  cursor: pointer;

  &_selected {
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:not(&_selected):hover {
      background-color: var(--bg-fourth-color);

      color: var(--primary-color);
    }
  }
}
</style>
