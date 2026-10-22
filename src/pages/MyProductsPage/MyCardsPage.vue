<template>
  <main class="collection-page">
    <div class="collection-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <button
      type="button"
      class="collection-page__filters-toggle"
      :class="{
        'collection-page__filters-toggle_open': isFiltersOpen,
      }"
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

    <div class="collection-page__inner _cnt">
      <div class="collection-page__aside-slot">
        <aside
          id="collection-filters"
          class="collection-page__aside aside"
          :class="{ aside_open: isFiltersOpen }"
          :aria-hidden="isFiltersMobile && !isFiltersOpen"
        >
          <div class="aside__header">
            <h2 class="aside__title _h6">
              {{ $t('Filters') }}
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

          <div class="aside__wrapper">
            <div class="aside__content">
              <div class="aside__section filter-group">
                <div class="filter-group__title">
                  {{ $t('Heroes') }}
                </div>

                <BaseDropdown
                  class="aside__dropdown"
                  :label="$t('Heroes')"
                  variant="relative"
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
                        'dropdown-option_selected': isSelected(
                          option.value,
                          collectionFilters.hero,
                        ),
                      }"
                      @click="selectFilter('hero', option.value, close)"
                    >
                      {{ option.label }}
                    </button>
                  </template>
                </BaseDropdown>
              </div>

              <div class="aside__section filter-group">
                <div class="filter-group__title">
                  {{ $t('Rarity') }}
                </div>

                <BaseDropdown
                  class="aside__dropdown"
                  :label="$t('Rarity')"
                  variant="relative"
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
                        'dropdown-option_selected': isSelected(
                          option.value,
                          collectionFilters.rarity,
                        ),
                      }"
                      @click="selectFilter('rarity', option.value, close)"
                    >
                      {{ option.label }}
                    </button>
                  </template>
                </BaseDropdown>
              </div>

              <div class="aside__section filter-group">
                <div class="filter-group__title">
                  {{ $t('Card Type') }}
                </div>

                <BaseDropdown
                  class="aside__dropdown"
                  :label="$t('Card Type')"
                  variant="relative"
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
                        'dropdown-option_selected': isSelected(
                          option.value,
                          collectionFilters.type,
                        ),
                      }"
                      @click="selectFilter('type', option.value, close)"
                    >
                      {{ option.label }}
                    </button>
                  </template>
                </BaseDropdown>
              </div>

              <div class="aside__section filter-group">
                <div class="filter-group__title">
                  {{ $t('Frame Type') }}
                </div>

                <BaseDropdown
                  class="aside__dropdown"
                  :label="$t('Frame Type')"
                  variant="relative"
                >
                  <template #default="{ close }">
                    <button
                      type="button"
                      class="dropdown-option"
                      :class="{
                        'dropdown-option_selected':
                          !collectionFilters.frameType,
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
                        'dropdown-option_selected': isSelected(
                          option.value,
                          collectionFilters.frameType,
                        ),
                      }"
                      @click="selectFilter('frameType', option.value, close)"
                    >
                      {{ option.label }}
                    </button>
                  </template>
                </BaseDropdown>
              </div>

              <div
                v-if="isRentedCollection"
                class="aside__section filter-group"
              >
                <div class="filter-group__title">
                  {{ $t('Rental Status') }}
                </div>

                <BaseDropdown
                  class="aside__dropdown"
                  :label="$t('Rental Status')"
                  variant="relative"
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
                  @click="applyFilters"
                >
                  {{ $t('Apply') }}
                </BaseButton>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div class="collection-page__content content">
        <div class="content__top top">
          <h1 class="top__title _h4">
            {{ $t('My Collection') }}
          </h1>

          <div class="top__content">
            <div class="top__switcher">
              <BaseButton
                type="button"
                class="top__switch top__switch_first"
                :variant="
                  !isRentedCollection ? 'switch-active' : 'switch-inactive'
                "
                :aria-pressed="!isRentedCollection"
                @click="setCollectionMode('bought')"
              >
                {{ $t('Bought') }}
              </BaseButton>

              <BaseButton
                type="button"
                class="top__switch top__switch_last"
                :variant="
                  isRentedCollection ? 'switch-active' : 'switch-inactive'
                "
                :aria-pressed="isRentedCollection"
                @click="setCollectionMode('rented')"
              >
                {{ $t('Rented') }}
              </BaseButton>
            </div>

            <BaseInput
              v-model="collectionFilters.search"
              class="top__search"
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
        </div>

        <div class="content__body">
          <LoadingSpinner v-if="loading" class="content__loader" />

          <div v-else-if="error" class="content__empty empty">
            <h2 class="empty__title _h4">
              {{ $t('Unable to load cards') }}
            </h2>

            <p class="empty__description">
              {{ error }}
            </p>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="clear"
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
                @open="openProduct(product)"
              />
            </div>
          </div>

          <div v-else class="content__empty empty">
            <h2 class="empty__title _h4">
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
      v-if="IS_DETAILS_MODAL_ACTIVE"
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
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { CloseIcon, FilterIcon, SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'

import MyProductCard from './components/MyProductCard.vue'
import MyCardDetailsModal from './modals/MyCardDetailsModal.vue'

const IS_DETAILS_MODAL_ACTIVE = false

const route = useRoute()
const router = useRouter()
const navigationStore = useNavigationStore()
const heroesStore = useHeroesStore()

const isMobileView = useMediaQuery('(max-width: 767.98px)')
const isFiltersMobile = useMediaQuery('(max-width: 991.98px)')

const { isFiltersOpen } = storeToRefs(navigationStore)

const {
  COLLECTION_SORT_OPTIONS,
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

const isSelected = (value, selectedValue) =>
  normalize(value) === normalize(selectedValue)

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
  normalizeOptions(availableFilters?.heroes ?? heroesStore.heroes ?? []),
)

const rarityOptions = computed(() =>
  normalizeOptions(availableFilters?.rarities ?? []),
)

const typeOptions = computed(() =>
  normalizeOptions(
    availableFilters?.types ?? availableFilters?.card_types ?? [],
  ),
)

const frameOptions = computed(() =>
  normalizeOptions(
    availableFilters?.frameTypes ??
      availableFilters?.frame_types ??
      availableFilters?.frames ??
      [],
  ),
)

const rentalStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
]

const selectedSortOption = computed(() =>
  COLLECTION_SORT_OPTIONS.find(option =>
    isSelected(option.value, filters.sort),
  ),
)

const hasLocalFilters = computed(() =>
  Boolean(
    collectionFilters.search.trim() ||
    appliedFilters.hero ||
    appliedFilters.rarity ||
    appliedFilters.type ||
    appliedFilters.frameType ||
    (isRentedCollection.value && filters.rentalStatus),
  ),
)

const matchesFilter = (actual, expected) => {
  if (!expected) return true

  if (actual && typeof actual === 'object') {
    return [actual.id, actual.value, actual.slug, actual.name].some(value =>
      isSelected(value, expected),
    )
  }

  return isSelected(actual, expected)
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
      Number(pagination?.total ?? 0) /
        Math.max(1, Number(filters.perPage ?? 21)),
    ),
  ),
)

const showPagination = computed(() => totalPages.value > 1)

const showPaginationControls = computed(
  () => !loading.value && !error.value && Number(pagination?.total ?? 0) > 0,
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

const closeProduct = () => {
  isProductDetailsOpen.value = false
  selectedProductId.value = null
  selectedCollectionItem.value = null
}

const setCollectionMode = async mode => {
  if (!['bought', 'rented'].includes(mode) || collectionMode.value === mode) {
    return
  }

  clearLocalFilters()
  closeFilters()
  closeProduct()

  Object.assign(filters, {
    page: 1,
    search: '',
    hero: '',
    rarity: '',
    type: '',
    frameType: '',
    rentalStatus: '',
    sort: COLLECTION_SORT_OPTIONS[0].value,
  })

  const query = { ...route.query }

  for (const key of [
    'page',
    'status',
    'sort',
    'search',
    'hero',
    'rarity',
    'type',
    'frame_type',
  ]) {
    delete query[key]
  }

  if (mode === 'rented') {
    query.collection = 'rented'
  } else {
    delete query.collection
  }

  await router.push({
    name: 'MyCardsPage',
    query,
  })
}

const reloadCards = async () => {
  await fetchCollectionProducts({ debounced: false })
}

const openProduct = product => {
  const cardId = getCardId(product)

  if (!cardId) return

  if (!IS_DETAILS_MODAL_ACTIVE) {
    router.push({
      name: 'ProductDetailsPage',
      params: {
        productId: cardId,
      },
      query: {
        from: 'collection',
        collection: isRentedCollection.value ? 'rented' : 'bought',
      },
    })

    return
  }

  selectedCollectionItem.value = product
  selectedProductId.value = cardId
  isProductDetailsOpen.value = true
}

const handleCardSold = async () => {
  closeProduct()
  await fetchCollectionProducts({ debounced: false })
}

watch(isFiltersMobile, isMobile => {
  if (!isMobile) closeFilters()
})

watch(
  [isFiltersOpen, isFiltersMobile],
  ([open, mobile]) => {
    document.body.classList.toggle('filters-drawer-open', open && mobile)
  },
  { immediate: true },
)

watch(collectionMode, () => {
  clearLocalFilters()
  closeProduct()
  closeFilters()
})

onBeforeUnmount(() => {
  document.body.classList.remove('filters-drawer-open')
  closeFilters()
})
</script>

<style lang="scss" scoped>
.collection-page {
  @include adaptiveValue('padding-top', 130, 80);
  @include adaptiveValue('padding-bottom', 54, 30);

  position: relative;

  &__bg {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    aspect-ratio: 1 / 0.54;

    pointer-events: none;
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

    border: 1px solid var(--border-priamry-color);
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
    z-index: 100;

    width: 100%;
    height: calc(100dvh - 51px);

    padding: 0;

    border: 0;
    outline: none;
    background-color: rgb(0 0 0 / 50%);

    -webkit-backdrop-filter: blur(64px);
    backdrop-filter: blur(64px);
  }

  &__inner {
    @include adaptiveValue('gap', 42, 10, 1800, 1370, 1);

    display: flex;
    align-items: stretch;

    width: 100%;

    @media (max-width: $md3) {
      display: block;
    }
  }

  &__aside-slot {
    @include adaptiveValue('min-width', 353, 250, 1800, 1370, 1);
    @include adaptiveValue('max-width', 353, 250, 1800, 1370, 1);

    flex: 0 0 auto;

    @media (max-width: $md3) {
      width: 0;
      min-width: 0;
      max-width: 0;
    }
  }

  &__aside {
    width: 100%;
    min-width: 0;
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

    @media (max-width: $md4) {
      flex-wrap: wrap;
      justify-content: space-between;
    }
  }

  &__switcher {
    display: flex;
    gap: 6px;

    @media (max-width: $md4) {
      order: 1;
    }

    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__switch {
    @media (min-width: $md6) {
      width: 100%;
      min-width: 80px;
    }
  }

  &__search {
    width: 100%;
    min-width: 0;
    max-width: 539px;

    margin: 0 auto;

    @media (max-width: $md4) {
      order: 3;
    }

    &-icon {
      min-width: 32px;
      height: 32px;

      color: var(--fourth-color);
    }
  }

  &__dropdown {
    @media (max-width: $md4) {
      order: 2;
    }

    @media (max-width: $md6) {
      flex: 1 1 100%;
      order: 4;
    }

    &-label {
      @include hide-item;
    }

    &-box {
      flex: 1 1 auto;

      width: 100%;
      min-width: 0;

      @media (min-width: $md6) {
        max-width: 230px;
      }

      @media (max-width: $md6) {
        flex: 1 1 100%;
      }
    }
  }
}

.aside {
  height: fit-content;

  @media (max-width: $md3) {
    position: fixed;
    top: 51px;
    bottom: 0;
    left: 0;
    z-index: 110;

    visibility: hidden;
    overflow-x: hidden;
    overflow-y: auto;

    width: 320px;
    min-width: 0;
    max-width: none;
    height: calc(100dvh - 51px);

    padding: 30px 10px;

    background-color: var(--bg-primary-color);
    opacity: 0;

    pointer-events: none;

    transform: translateX(-105%);
    transition: all 0.3s ease 0s;

    overscroll-behavior: contain;

    &_open {
      visibility: visible;

      opacity: 1;

      pointer-events: auto;

      transform: translateX(0);
    }
  }

  &__header {
    @include adaptiveValue('padding-top', 30, 10);
    @include adaptiveValue('padding-bottom', 30, 10);
    @include adaptiveValue('padding-left', 24, 10);
    @include adaptiveValue('padding-right', 24, 10);
    @include adaptiveValue('border-radius', 12, 10);

    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;

    background-color: var(--bg-fourth-color);

    &:not(:last-child) {
      margin-bottom: 4px;
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
    font-weight: 400;
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

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    outline: none;
    background-color: var(--bg-primary-color);

    color: var(--hint-primary-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    @media (any-hover: hover) {
      &:hover {
        color: var(--fourth-color);
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

  &__section {
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  &__bottom {
    @include adaptiveValue('padding-top', 30, 10);
    @include adaptiveValue('padding-bottom', 30, 10);
    @include adaptiveValue('padding-left', 24, 10);
    @include adaptiveValue('padding-right', 24, 10);
    @include adaptiveValue('border-radius', 12, 10);

    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;

    background-color: var(--bg-fourth-color);
  }

  &__submit {
    max-width: 120px;
  }
}

.filter-group {
  &__title {
    @include hide-item;
  }
}

.content {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  min-width: 0;

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 18);
    }
  }

  &__body {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 54, 22);
    }
  }

  &__loader,
  &__empty {
    margin: auto;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
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

    flex-basis: 16.666%;

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
}

.empty {
  text-align: center;

  &__title {
    position: relative;
    z-index: 1;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__reset {
    max-width: 250px;

    margin: 0 auto;
  }
}

.pagination {
  display: flex;
  justify-content: center;
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
