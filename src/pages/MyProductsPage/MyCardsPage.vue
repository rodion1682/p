<template>
  <main class="collection-page">
    <div class="collection-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
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
        v-if="isFiltersOpen"
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
                  'dropdown-option_selected': option.value === filters.sort,
                }"
                :aria-selected="option.value === filters.sort"
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
        :class="{
          top__search_filled: collectionFilters.search.trim().length > 0,
        }"
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
                  @click="selectHero('', close)"
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
                  @click="selectHero(option.value, close)"
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
              :label="
                selectedRarityOption
                  ? formatOptionLabel(
                      selectedRarityOption.label ??
                        selectedRarityOption.name ??
                        selectedRarityOption.value,
                    )
                  : $t('All')
              "
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
                  @click="selectRarity('', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in rarityOptions"
                  :key="option.value ?? option.id ?? option"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': isSelected(
                      option.value ?? option.id ?? option,
                      collectionFilters.rarity,
                    ),
                  }"
                  @click="
                    selectRarity(option.value ?? option.id ?? option, close)
                  "
                >
                  {{
                    formatOptionLabel(
                      option.label ?? option.name ?? option.value ?? option,
                    )
                  }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Card Type') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="
                selectedTypeOption
                  ? formatOptionLabel(
                      selectedTypeOption.label ??
                        selectedTypeOption.name ??
                        selectedTypeOption.value,
                    )
                  : $t('All')
              "
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
                  @click="selectType('', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in typeOptions"
                  :key="option.value ?? option.id ?? option"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': isSelected(
                      option.value ?? option.id ?? option,
                      collectionFilters.type,
                    ),
                  }"
                  @click="
                    selectType(option.value ?? option.id ?? option, close)
                  "
                >
                  {{
                    formatOptionLabel(
                      option.label ?? option.name ?? option.value ?? option,
                    )
                  }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Frame Type') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="
                selectedFrameOption
                  ? formatOptionLabel(
                      selectedFrameOption.label ??
                        selectedFrameOption.name ??
                        selectedFrameOption.value,
                    )
                  : $t('All')
              "
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
                  @click="selectFrameType('', close)"
                >
                  {{ $t('All') }}
                </button>

                <button
                  v-for="option in frameOptions"
                  :key="option.value ?? option.id ?? option"
                  type="button"
                  class="dropdown-option"
                  :class="{
                    'dropdown-option_selected': isSelected(
                      option.value ?? option.id ?? option,
                      collectionFilters.frameType,
                    ),
                  }"
                  @click="
                    selectFrameType(option.value ?? option.id ?? option, close)
                  "
                >
                  {{
                    formatOptionLabel(
                      option.label ?? option.name ?? option.value ?? option,
                    )
                  }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <div v-if="isRentedCollection" class="aside__section filter-group">
            <div class="filter-group__title">{{ $t('Rental Status') }}:</div>

            <BaseDropdown
              class="filter-group__dropdown"
              :label="
                selectedRentalStatusOption
                  ? $t(selectedRentalStatusOption.label)
                  : $t('All')
              "
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
            <span class="pagination__dropdown-label">
              {{ $t('Items per page') }}:
            </span>

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

          <div v-if="showPagination" class="pagination__pagination">
            <div class="pagination__pages">
              <button
                type="button"
                class="pagination__button"
                :disabled="Number(filters.page) <= 1"
                :aria-label="$t('Previous page')"
                @click="onPageChange(Number(filters.page) - 1)"
              >
                ‹
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                class="pagination__button"
                :class="{
                  pagination__button_active: Number(filters.page) === page,
                }"
                :aria-current="
                  Number(filters.page) === page ? 'page' : undefined
                "
                @click="onPageChange(page)"
              >
                {{ page }}
              </button>

              <button
                type="button"
                class="pagination__button"
                :disabled="Number(filters.page) >= totalPages"
                :aria-label="$t('Next page')"
                @click="onPageChange(Number(filters.page) + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <MyCardDetailsModal
    v-model:show="isProductDetailsOpen"
    :product-id="selectedProductId"
    :collection-item="selectedCollectionItem"
    :rented="isRentedCollection"
    @close="closeProduct"
    @sold="handleCardSold"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { CloseIcon, SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

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

const rentalStatusOptions = [
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'expired',
    label: 'Expired',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
]

const route = useRoute()
const router = useRouter()

const heroesStore = useHeroesStore()
const navigationStore = useNavigationStore()

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
  initialized,

  filters,
  availableFilters,
  pagination,

  updateFilters,
  resetFilters: resetStoreFilters,
  fetchCollectionProducts,
} = useProductList()

const selectedProductId = ref(null)
const selectedCollectionItem = ref(null)
const isProductDetailsOpen = ref(false)

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

const normalizeValue = value => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

const isSelected = (value, selectedValue) => {
  return normalizeValue(value) === normalizeValue(selectedValue)
}

const formatOptionLabel = value => {
  if (!value) {
    return ''
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const getCard = product => {
  if (!product) {
    return {}
  }

  return (
    product?.card ||
    product?.product?.card ||
    product?.product ||
    product?.item?.card ||
    product?.item ||
    product ||
    {}
  )
}

const getCardId = product => {
  if (!product) {
    return null
  }

  if (isRentedCollection.value) {
    return (
      product?.card_id ??
      product?.card?.id ??
      product?.product?.card_id ??
      product?.product?.card?.id ??
      product?.item?.card_id ??
      product?.item?.card?.id ??
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
      `${getCardId(product)}-${
        product?.rental_period_id ?? product?.rental_period?.id ?? 'rental'
      }`
    )
  }

  return (
    product?.instance_uuid ??
    product?.card_instance_id ??
    product?.id ??
    `owned-${getCardId(product)}`
  )
}

const getCardName = product => {
  const card = getCard(product)

  return card?.name || card?.title || product?.card_name || product?.name || ''
}

const getCardHeroId = product => {
  const card = getCard(product)

  return (
    card?.hero_id ??
    card?.hero?.id ??
    product?.hero_id ??
    product?.hero?.id ??
    ''
  )
}

const getCardRarity = product => {
  const card = getCard(product)

  return (
    card?.rarity?.name ??
    card?.rarity?.slug ??
    card?.rarity ??
    product?.rarity?.name ??
    product?.rarity ??
    ''
  )
}

const getCardType = product => {
  const card = getCard(product)

  return (
    card?.type?.name ??
    card?.type?.slug ??
    card?.type ??
    product?.type?.name ??
    product?.type ??
    ''
  )
}

const getCardFrameId = product => {
  const card = getCard(product)

  return (
    card?.card_frame_set_id ??
    card?.frame_type?.id ??
    card?.frame?.id ??
    product?.card_frame_set_id ??
    product?.frame_type_id ??
    ''
  )
}

const heroOptions = computed(() => {
  return (heroesStore.heroes || []).map(hero => ({
    label: hero.name,
    value: hero.id,
  }))
})

const rarityOptions = computed(() => {
  return Array.isArray(availableFilters.rarities)
    ? availableFilters.rarities
    : []
})

const typeOptions = computed(() => {
  return Array.isArray(availableFilters.types) ? availableFilters.types : []
})

const frameOptions = computed(() => {
  return Array.isArray(availableFilters.frameTypes)
    ? availableFilters.frameTypes
    : []
})

const selectedHeroOption = computed(() => {
  return heroOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.hero)
  })
})

const selectedRarityOption = computed(() => {
  return rarityOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.rarity)
  })
})

const selectedTypeOption = computed(() => {
  return typeOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.type)
  })
})

const selectedFrameOption = computed(() => {
  return frameOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.frameType)
  })
})

const selectedSortOption = computed(() => {
  return COLLECTION_SORT_OPTIONS.find(option => {
    return option.value === filters.sort
  })
})

const selectedRentalStatusOption = computed(() => {
  return rentalStatusOptions.find(option => {
    return option.value === filters.rentalStatus
  })
})

const hasLocalFilters = computed(() => {
  return Boolean(
    collectionFilters.search.trim() ||
    appliedFilters.hero ||
    appliedFilters.rarity ||
    appliedFilters.type ||
    appliedFilters.frameType ||
    filters.rentalStatus,
  )
})

const visibleProducts = computed(() => {
  const search = normalizeValue(collectionFilters.search)

  return collectionProducts.value.filter(product => {
    if (search && !normalizeValue(getCardName(product)).includes(search)) {
      return false
    }

    if (
      appliedFilters.hero &&
      !isSelected(getCardHeroId(product), appliedFilters.hero)
    ) {
      return false
    }

    if (
      appliedFilters.rarity &&
      !isSelected(getCardRarity(product), appliedFilters.rarity)
    ) {
      return false
    }

    if (
      appliedFilters.type &&
      !isSelected(getCardType(product), appliedFilters.type)
    ) {
      return false
    }

    if (
      appliedFilters.frameType &&
      !isSelected(getCardFrameId(product), appliedFilters.frameType)
    ) {
      return false
    }

    return true
  })
})

const totalPages = computed(() => {
  const total = Number(pagination.total || 0)
  const perPage = Math.max(1, Number(filters.perPage) || 1)

  return Math.max(1, Math.ceil(total / perPage))
})

const showPagination = computed(() => {
  return (
    !loading.value &&
    collectionProducts.value.length > 0 &&
    Number(pagination.total || 0) > Number(filters.perPage || 0)
  )
})

const showPaginationControls = computed(() => {
  return (
    !loading.value && initialized.value && collectionProducts.value.length > 0
  )
})

const createCollectionQuery = mode => {
  const query = {
    ...route.query,
  }

  delete query.page
  delete query.status

  if (mode === 'rented') {
    query.collection = 'rented'
  } else {
    delete query.collection
  }

  return query
}

const setCollectionMode = async mode => {
  const rented = mode === 'rented'

  if (rented === isRentedCollection.value) {
    return
  }

  closeFilters()
  closeProduct()

  await router.push({
    name: 'MyCardsPage',
    query: createCollectionQuery(mode),
  })
}

const selectHero = (value, close) => {
  collectionFilters.hero = value
  close()
}

const selectRarity = (value, close) => {
  collectionFilters.rarity = value
  close()
}

const selectType = (value, close) => {
  collectionFilters.type = value
  close()
}

const selectFrameType = (value, close) => {
  collectionFilters.frameType = value
  close()
}

const selectRentalStatus = async (value, close) => {
  close()

  if (filters.rentalStatus === value) {
    return
  }

  await updateFilters({
    rentalStatus: value,
    page: 1,
  })
}

const applyFilters = () => {
  appliedFilters.hero = collectionFilters.hero
  appliedFilters.rarity = collectionFilters.rarity
  appliedFilters.type = collectionFilters.type
  appliedFilters.frameType = collectionFilters.frameType

  closeFilters()
}

const selectSort = async (value, close) => {
  close()

  if (filters.sort === value) {
    return
  }

  await updateFilters({
    sort: value,
    page: 1,
  })
}

const selectPerPage = async (value, close) => {
  close()

  const perPage = Number(value)

  if (Number(filters.perPage) === perPage) {
    return
  }

  await updateFilters({
    perPage,
    page: 1,
  })
}

const clearLocalFilters = () => {
  collectionFilters.search = ''
  collectionFilters.hero = ''
  collectionFilters.rarity = ''
  collectionFilters.type = ''
  collectionFilters.frameType = ''

  appliedFilters.hero = ''
  appliedFilters.rarity = ''
  appliedFilters.type = ''
  appliedFilters.frameType = ''
}

const resetFilters = async () => {
  clearLocalFilters()

  await resetStoreFilters()

  closeFilters()
}

const reloadCards = async () => {
  await fetchCollectionProducts({
    debounced: false,
  })
}

const onPageChange = async page => {
  const normalizedPage = Number(page)

  if (
    !Number.isInteger(normalizedPage) ||
    normalizedPage < 1 ||
    normalizedPage === Number(filters.page)
  ) {
    return
  }

  await updateFilters({
    page: normalizedPage,
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const openProduct = product => {
  const cardId = getCardId(product)

  if (!cardId) {
    console.error('Cannot open card details modal: card ID is missing', product)
    return
  }

  selectedCollectionItem.value = product
  selectedProductId.value = cardId
  isProductDetailsOpen.value = true
}

const closeProduct = () => {
  isProductDetailsOpen.value = false
  selectedProductId.value = null
  selectedCollectionItem.value = null
}

const handleCardSold = async saleData => {
  try {
    closeProduct()

    await fetchCollectionProducts({
      debounced: false,
    })

    console.log('Card sale successfully created:', saleData)
  } catch (refreshError) {
    console.error(
      'Unable to refresh collection after selling card:',
      refreshError,
    )
  }
}

const toggleFilters = () => {
  if (!isFiltersMobile.value) {
    return
  }

  navigationStore.toggleFilters()
}

const closeFilters = () => {
  navigationStore.closeFilters()
}

watch(isFiltersMobile, isMobile => {
  if (!isMobile) {
    closeFilters()
  }
})

watch(collectionMode, () => {
  clearLocalFilters()
  closeProduct()
  closeFilters()
})

onBeforeUnmount(() => {
  closeProduct()
  closeFilters()
})
</script>

<style lang="scss" scoped>
.collection-page {
  @include adaptiveValue('padding-top', 120, 80);
  @include adaptiveValue('padding-bottom', 46, 30);

  position: relative;

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
    z-index: 1;

    display: flex;

    width: 100%;

    @media (max-width: $md3) {
      display: block;
    }
  }

  &__aside {
    flex: 0 0 220px;

    width: 220px;
    min-width: 220px;
    max-width: 220px;

    @media (max-width: $md3) {
      display: none;
    }
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__filters-button {
    display: none;

    @media (max-width: $md3) {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      width: 100%;
      min-height: 42px;

      margin-bottom: 18px;
    }
  }

  &__filters-overlay {
    position: fixed;
    inset: 0;
    z-index: 110;

    display: none;

    background-color: rgb(0 0 0 / 65%);

    @media (max-width: $md3) {
      display: block;
    }
  }

  &__filters-panel {
    position: absolute;
    top: 0;
    left: 0;

    overflow-y: auto;

    width: min(340px, 90vw);
    height: 100%;

    padding: 24px 16px;

    background-color: var(--bg-primary-colorr);
  }

  &__filters-close {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--secondary-color);

    cursor: pointer;
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
      line-height: 100%;
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
      min-width: 20px;
      height: 20px;

      opacity: 0.5;

      color: var(--secondary-color);
    }

    &_filled {
      .top__search-icon {
        opacity: 1;
      }
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

    &__controls {
      gap: 12px;
    }

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

  width: 100%;
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
    color: var(--secondary-color);
    font-weight: 500;
    line-height: 120%;
  }

  &__close {
    display: none;

    @media (max-width: $md3) {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 32px;
      height: 32px;

      border: 0;
      background: transparent;

      color: var(--secondary-color);

      cursor: pointer;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;

    width: 100%;
  }

  &__filters {
    display: flex;
    flex-direction: column;
    gap: 20px;

    width: 100%;
  }

  &__submit {
    width: 100%;

    &:not(:first-child) {
      margin-top: 24px;
    }
  }

  &__clear {
    width: fit-content;

    margin-top: 20px;
    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fifth-color);
    font-size: 14px;
    line-height: 140%;

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

  &__label {
    color: var(--seventh-color);
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;
  }

  &__dropdown {
    width: 100%;
  }

  &__range {
    width: 100%;
  }

  &__prices {
    display: flex;
    align-items: center;
    gap: 10px;

    width: 100%;
  }

  &__price {
    flex: 1 1 50%;

    min-width: 0;
  }

  &__separator {
    flex: 0 0 auto;

    color: var(--seventh-color);
  }
}

.price-slider {
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  &__track {
    position: relative;

    width: 100%;
    height: 4px;

    border-radius: 4px;
    background-color: var(--border-fourth-color);
  }

  &__range {
    position: absolute;
    top: 0;

    height: 100%;

    border-radius: 4px;
    background-color: var(--secondary-color);
  }

  &__input {
    position: absolute;
    top: 50%;
    left: 0;

    width: 100%;
    height: 0;

    margin: 0;

    background: transparent;

    appearance: none;
    pointer-events: none;

    transform: translateY(-50%);

    &::-webkit-slider-thumb {
      width: 14px;
      height: 14px;

      border: 2px solid var(--secondary-color);
      border-radius: 50%;
      background-color: var(--primary-color);

      appearance: none;
      cursor: pointer;
      pointer-events: auto;
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 12px;

      border: 2px solid var(--secondary-color);
      border-radius: 50%;
      background-color: var(--primary-color);

      cursor: pointer;
      pointer-events: auto;
    }
  }

  &__values {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__value {
    flex: 1 1 50%;

    min-width: 0;
  }

  &__separator {
    color: var(--seventh-color);
  }
}

.content {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  min-width: 0;

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

  &__description {
    margin-bottom: 20px;

    color: var(--seventh-color);
  }

  &__reset {
    max-width: 300px;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  width: 100%;
  min-height: 300px;

  text-align: center;

  &__title {
    color: var(--secondary-color);
  }

  &__text {
    color: var(--seventh-color);
  }

  &__button {
    min-width: 180px;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  width: 100%;

  &__per-page {
    display: flex;
    align-items: center;
    gap: 16px;

    min-width: 0;
  }

  &__label {
    color: var(--seventh-color);
    font-size: 14px;
    line-height: 140%;
    white-space: nowrap;
  }

  &__dropdown {
    min-width: 70px;
  }

  &__pages {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 32px;
    height: 32px;

    padding: 0 8px;

    border: 1px solid transparent;
    border-radius: 5px;
    background: transparent;

    color: var(--secondary-color);
    font-size: 14px;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_active {
      border-color: var(--border-fourth-color);
      background-color: var(--bg-secondary-color);
    }

    &:disabled {
      opacity: 0.4;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--border-fourth-color);
      }
    }
  }

  &__dots {
    padding: 0 4px;

    color: var(--seventh-color);
  }

  @media (max-width: $md4) {
    flex-direction: column;
    align-items: center;
    gap: 16px;

    &__pages {
      flex-wrap: wrap;
      justify-content: center;
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

.filters-overlay-enter-active,
.filters-overlay-leave-active {
  transition: opacity 0.3s ease;

  .collection-page__filters-panel {
    transition: transform 0.3s ease;
  }
}

.filters-overlay-enter-from,
.filters-overlay-leave-to {
  opacity: 0;

  .collection-page__filters-panel {
    transform: translateX(-100%);
  }
}
</style>
