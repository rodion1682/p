<template>
  <div class="relative min-h-screen px-4 pb-[166px] pt-[124px]">
    <!-- Ornaments -->
    <img
      src="@/assets/images/magiculus/bg2.webp"
      alt="Hero Background"
      class="pointer-events-none absolute right-0 top-0 -z-[1] w-full select-none object-contain object-top"
    />
    <div
      class="pointer-events-none absolute right-0 top-0 h-[60vw] w-full select-none bg-gradient-to-b from-[#00000099] to-[#000000]"
    ></div>
    <!-- Page Content Container -->
    <div class="relative z-[1] mx-auto max-w-[1320px]">
      <div
        class="mb-[48px] text-center font-primary text-[48px] md:text-[96px]"
      >
        {{ $t('My Cards & Packs') }}
      </div>

      <div
        class="mb-6 flex flex-col items-center border-b-2 border-white/20 pb-6 md:flex-row md:justify-between"
      >
        <!-- Filters Button -->
        <div
          class="relative flex h-[65px] w-[424px] max-w-full items-center md:mr-[24px]"
        >
          <img
            src="@/assets/images/magiculus/tabs.webp"
            alt="tabs"
            class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-fill"
          />
          <div
            class="absolute left-1/2 top-1/2 h-[40px] w-[1px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-black/0 via-[rgba(244,206,145,0.39)] to-black/0"
          ></div>

          <router-link
            :to="{ name: 'MyCardsPage' }"
            class="relative flex h-full flex-1 items-center justify-center text-center font-primary text-[20px] text-white/60 transition-all duration-300 hover:text-white"
            >{{ $t('Bought Cards') }}</router-link
          >
          <router-link
            :to="{ name: 'MyRentCardsPage' }"
            class="relative flex h-full flex-1 items-center justify-center bg-gradient-to-b from-black/0 via-black/40 to-black/0 text-center font-primary text-[20px] text-accent"
            >{{ $t('Rented Cards') }}</router-link
          >
          <router-link
            :to="{ name: 'MyPacksPage' }"
            class="relative flex h-full flex-1 items-center justify-center text-center font-primary text-[20px] text-white/60 transition-all duration-300 hover:text-white"
            >{{ $t('My Packs') }}</router-link
          >
        </div>

        <!-- Search Bar and Sort -->
        <div
          class="mt-5 flex w-[424px] max-w-full flex-col gap-[20px] md:mt-0 md:w-[calc(100%_-_448px)] md:flex-row md:items-center md:justify-between md:gap-[60px]"
        >
          <div class="whitespace-nowrap">
            <FilterDropdown
              class="w-full min-w-[200px]"
              v-model="filters.type"
              :options="availableFilters.types || []"
              placeholder="All Cards"
              variant="filter"
              @update:model-value="handleTypeChange"
            />
          </div>
          <!-- Sort -->
          <div class="whitespace-nowrap">
            <FilterDropdown
              v-model="filters.sort"
              @update:model-value="handleSortChange"
              :options="SORT_OPTIONS"
              placeholder="Sort by"
              variant="sort"
            />
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="inline-flex w-full justify-center align-top">
        <div class="flex justify-center py-[40px]">
          <!-- <LoadingSpinner /> -->
        </div>
      </div>
      <div
        v-else-if="myRentProducts?.length"
        class="mb-[46px] inline-block w-full align-top md:mt-0"
      >
        <div
          class="xs:grid-cols-1 grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <MyProductCard
            v-for="product in myRentProducts"
            :key="product.card_id ? product.card_id : product.id"
            :product="product"
            type="default"
            class="w-full"
            :my="true"
          />
        </div>
      </div>
      <div
        v-else
        class="mb-[42px] inline-flex w-full flex-col items-center pt-[48px] text-center align-top"
      >
        <p class="mb-[20px] text-[18px] text-secondary">
          {{ $t('No products found') }}
        </p>
        <button
          @click="resetFilters"
          class="p-0 text-[14px] text-accent underline hover:no-underline"
        >
          {{ $t('Clear all') }}
        </button>
        {{ myRentProducts }}
      </div>

      <!-- Pagination -->
      <div
        v-if="
          !loading &&
          myRentProducts?.length &&
          pagination.total > filters.perPage
        "
        class="flex w-full flex-wrap items-center justify-between gap-4"
      >
        <div class="text-base font-medium opacity-40">
          {{ $t('Results ') }} 1 - {{ filters.perPage }} {{ $t('out of') }}
          {{ pagination.total }}
        </div>
        <PaginationComponent
          :total-pages="Math.ceil(pagination.total / filters.perPage)"
          :current-page="Number(filters.page)"
          :is-small="isMobileView"
          @update:current-page="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import FilterDropdown from '@/components/dropdown/FilterDropdown.vue'
import MyProductCard from '@/components/MyProductCard.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  isSalePage: Boolean,
  isNewItemsPage: Boolean,
})

const isMobileView = useMediaQuery('(max-width: 768px)')
const route = useRoute()
const router = useRouter()

// Computed property to determine if we're on sale or new items page
const isSalePage = computed(() => route.name === 'SalePage')
const isNewItemsPage = computed(() => route.name === 'NewItemsPage')

// Filters visibility control
const isFiltersVisible = ref(false)
const toggleFiltersVisible = () => {
  isFiltersVisible.value = !isFiltersVisible.value
}

// New refs for price inputs
const minPrice = ref('')
const maxPrice = ref('')

const {
  SORT_OPTIONS,
  myRentProducts,
  loading,
  filters,
  availableFilters,
  pagination,
  updateFilters,
  resetFilters: originalResetFilters,
} = useProductList()

// Mount and cleanup
onMounted(() => {
  // Initialize price inputs if filters.priceRange is already set
  if (filters.priceRange) {
    minPrice.value = filters.priceRange.min || ''
    maxPrice.value = filters.priceRange.max || ''
  }
})

// Watch for route changes to update filters
watch(
  () => route.name,
  newRouteName => {
    // Reset sale and new filters
    filters.sale = false
    filters.new = false

    // Set appropriate filter based on route
    if (newRouteName === 'SalePage') {
      resetFilters()
      filters.sale = true
    } else if (newRouteName === 'NewItemsPage') {
      resetFilters()
      filters.new = true
    }

    // Update filters and fetch new data
    updateFilters({ page: 1 })
  },
)

// Check if there are additional filters
const hasAdditionalFilters = computed(() => {
  return (
    (availableFilters.qualities && availableFilters.qualities.length > 0) ||
    (availableFilters.exterior_names &&
      availableFilters.exterior_names.length > 0) ||
    (availableFilters.classes && availableFilters.classes.length > 0) ||
    (availableFilters.heroes && availableFilters.heroes.length > 0)
  )
})

// Event handlers
const clearSearch = () => {
  filters.search = ''
  updateFilters({ page: 1 })
}

const onPageChange = page => {
  updateFilters({ page })
  // Only scroll to top when page changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePriceRangeChange = () => {
  if (!filters.priceRange) {
    filters.priceRange = {}
  }

  filters.priceRange.min = minPrice.value ? Number(minPrice.value) : null
  filters.priceRange.max = maxPrice.value ? Number(maxPrice.value) : null
}

const handleSortChange = value => {
  updateFilters({ sort: value, page: 1 })
}

const handleTypeChange = value => {
  updateFilters({ type: value, page: 1 })
}

const onSearchChange = () => {
  updateFilters({ page: 1 })
}

// Modify resetFilters
const resetFilters = () => {
  originalResetFilters()

  // Reset UI state
  minPrice.value = ''
  maxPrice.value = ''
  isFiltersVisible.value = false
}
</script>

<style scoped>
/* Custom scrollbar for filter divs */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  border-radius: 3px;
  background: #f5f5f5;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: #d9d9d9;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}
</style>
