<template>
  <main class="collection-page">
    <div class="collection-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.jpg" alt="" />
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
      <div class="top__decor top__decor_left _ibg-contain">
        <img src="@/assets/img/modal-decor.png" alt="" />
      </div>

      <div class="top__decor top__decor_right _ibg-contain">
        <img src="@/assets/img/modal-decor.png" alt="" />
      </div>

      <div class="top__switcher">
        <BaseButton
          type="button"
          class="top__switch"
          :variant="!isRentedCollection ? 'primary' : 'hint-bordered'"
          :aria-pressed="!isRentedCollection"
          @click="setCollectionMode('bought')"
        >
          {{ $t('Bought') }}
        </BaseButton>

        <BaseButton
          type="button"
          class="top__switch"
          :variant="isRentedCollection ? 'primary' : 'hint-bordered'"
          :aria-pressed="isRentedCollection"
          @click="setCollectionMode('rented')"
        >
          {{ $t('Rented') }}
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
              v-for="option in COLLECTION_SORT_OPTIONS"
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
                class="filter-group__dropdown"
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
                      'dropdown-option_selected': collectionFilters.hero === '',
                    }"
                    :aria-selected="collectionFilters.hero === ''"
                    role="option"
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
                    :aria-selected="
                      isSelected(option.value, collectionFilters.hero)
                    "
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
                {{ $t('Rarity') }}
              </div>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedRarityOption?.label
                    ? formatOptionLabel(selectedRarityOption.label)
                    : $t('All')
                "
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
                      'dropdown-option_selected':
                        collectionFilters.rarity === '',
                    }"
                    :aria-selected="collectionFilters.rarity === ''"
                    role="option"
                    @click="selectRarity('', close)"
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
                    :aria-selected="
                      isSelected(option.value, collectionFilters.rarity)
                    "
                    role="option"
                    @click="selectRarity(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="aside__section filter-group">
              <div class="filter-group__title">
                {{ $t('Card Type') }}
              </div>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedTypeOption?.label
                    ? formatOptionLabel(selectedTypeOption.label)
                    : $t('All')
                "
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
                      'dropdown-option_selected': collectionFilters.type === '',
                    }"
                    :aria-selected="collectionFilters.type === ''"
                    role="option"
                    @click="selectType('', close)"
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
                    :aria-selected="
                      isSelected(option.value, collectionFilters.type)
                    "
                    role="option"
                    @click="selectType(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="aside__section filter-group">
              <div class="filter-group__title">
                {{ $t('Frame Type') }}
              </div>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedFrameOption?.label
                    ? formatOptionLabel(selectedFrameOption.label)
                    : $t('All')
                "
                :placeholder="!selectedFrameOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected':
                        collectionFilters.frameType === '',
                    }"
                    :aria-selected="collectionFilters.frameType === ''"
                    role="option"
                    @click="selectFrameType('', close)"
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
                    :aria-selected="
                      isSelected(option.value, collectionFilters.frameType)
                    "
                    role="option"
                    @click="selectFrameType(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div v-if="isRentedCollection" class="aside__section filter-group">
              <div class="filter-group__title">
                {{ $t('Rental Status') }}
              </div>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedRentalStatusOption?.label
                    ? $t(selectedRentalStatusOption.label)
                    : $t('All')
                "
                :placeholder="!selectedRentalStatusOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': filters.rentalStatus === '',
                    }"
                    :aria-selected="filters.rentalStatus === ''"
                    role="option"
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
                        option.value === filters.rentalStatus,
                    }"
                    :aria-selected="option.value === filters.rentalStatus"
                    role="option"
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
              @click="applyFilters"
            >
              {{ $t('Apply') }}
            </BaseButton>
          </div>
        </div>
      </aside>

      <div class="collection-page__content content">
        <div class="content__body">
          <LoadingSpinner
            v-if="loading || !initialized"
            class="content__loader"
          />

          <div v-else-if="error" class="content__empty empty">
            <div class="empty__title _h3">
              {{ $t(error) }}
            </div>

            <BaseButton
              type="button"
              class="empty__reset"
              variant="bordered"
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
                @open="openProduct"
              />
            </div>
          </div>

          <div v-else class="content__empty empty">
            <div class="empty__title _h3">
              {{
                isRentedCollection
                  ? $t('No rented cards found')
                  : $t('No bought cards found')
              }}
            </div>

            <div class="empty__description">
              <template v-if="hasLocalFilters">
                {{ $t('Try changing or clearing your collection filters.') }}
              </template>

              <template v-else-if="isRentedCollection">
                {{ $t('Your rented cards will appear here.') }}
              </template>

              <template v-else>
                {{ $t('Your purchased cards will appear here.') }}
              </template>
            </div>

            <BaseButton
              v-if="hasLocalFilters"
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
            :total-pages="totalPages"
            :current-page="Number(filters.page)"
            :is-small="isMobileView"
            @update:current-page="onPageChange"
          />
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
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
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
  @include adaptiveValue('padding-top', 117, 75);
  @include adaptiveValue('padding-bottom', 32, 25);

  position: relative;

  min-height: 100vh;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    max-height: 915px;

    pointer-events: none;
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

    pointer-events: none;

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
      white-space: nowrap;
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

    &_filled {
      :deep(.base-input__control) {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }
    }

    &-icon {
      display: block;

      width: 20px;
      min-width: 20px;
      height: 20px;

      color: var(--hint-secondary-color) !important;

      pointer-events: none;
    }

    @media (max-width: $md3) {
      flex: 1 1 100%;

      max-width: none;
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

    padding-right: 0;
    padding-left: 0;

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
  &__title {
    color: var(--secondary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 8);
    }
  }

  &__dropdown {
    width: 100%;
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
      @include adaptiveValue('margin-bottom', 63, 20);
    }
  }

  &__loader {
    display: flex;

    margin: auto;
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

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    margin: auto;
  }
}

.empty {
  position: relative;
  z-index: 1;

  width: 100%;
  max-width: 480px;

  text-align: center;

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__description {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__reset {
    max-width: 300px;

    margin-right: auto;
    margin-left: auto;
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
  text-transform: capitalize;
  white-space: nowrap;

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
