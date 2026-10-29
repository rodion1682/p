import axios from '@/plugins/axios'
import { useCurrencyStore } from '@/stores/currency'
import { debounce } from 'lodash'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const DEBOUNCE_DELAY = 400

export const PRODUCT_GAMES = {
  CS2: 'cs2',
  DOTA2: 'dota2',
}

export const ALLOWED_GAMES = [PRODUCT_GAMES.CS2, PRODUCT_GAMES.DOTA2]

export const SORT_OPTIONS = [
  { value: 'desc', label: 'From high to low' },
  { value: 'asc', label: 'From low to high' },
]

export const DEFAULT_FILTERS = {
  search: '',
  sort: 'desc',
  priceRange: { min: null, max: null },
  page: 1,
  perPage: 24,
  type: [],
  quality: [],
  subcategories: [],
  hero: [],
  class: [],
  exterior_name: [],
  special_offer: '',
}

const normalizeGame = value =>
  String(value || '')
    .trim()
    .toLowerCase()

const toArray = value =>
  (Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .flatMap(item => String(item).split(','))
    .map(item => item.trim())
    .filter(Boolean)

const toPositiveInteger = (value, fallback) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

const toNullableNumber = value => {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

const emptyFilterState = () => ({
  ...DEFAULT_FILTERS,
  priceRange: { min: null, max: null },
  type: [],
  quality: [],
  subcategories: [],
  hero: [],
  class: [],
  exterior_name: [],
})

export function useProductList(initialCategory = PRODUCT_GAMES.CS2) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const currencyStore = useCurrencyStore()

  const allowedGames = computed(() =>
    [...new Set(ALLOWED_GAMES.map(normalizeGame))].filter(game =>
      Object.values(PRODUCT_GAMES).includes(game),
    ),
  )

  const resolveAllowedGame = value => {
    const game = normalizeGame(value)

    return game === 'all' || allowedGames.value.includes(game)
      ? game
      : allowedGames.value[0] || PRODUCT_GAMES.CS2
  }

  const currentCategory = ref(
    resolveAllowedGame(route.query.category || initialCategory),
  )

  const currentGame = computed(() => currentCategory.value)

  const isCs2 = computed(() => currentCategory.value === PRODUCT_GAMES.CS2)

  const isDota2 = computed(() => currentCategory.value === PRODUCT_GAMES.DOTA2)

  const isCs2Allowed = computed(() =>
    allowedGames.value.includes(PRODUCT_GAMES.CS2),
  )

  const isDota2Allowed = computed(() =>
    allowedGames.value.includes(PRODUCT_GAMES.DOTA2),
  )

  const isSingleGame = computed(() => allowedGames.value.length === 1)

  const isCs2Only = computed(
    () => isSingleGame.value && allowedGames.value[0] === PRODUCT_GAMES.CS2,
  )

  const isDota2Only = computed(
    () => isSingleGame.value && allowedGames.value[0] === PRODUCT_GAMES.DOTA2,
  )

  const products = ref([])
  const loading = ref(false)
  const subcategoriesLoading = ref(false)
  const error = ref(null)
  const ready = ref(false)

  const availableFilters = reactive({
    types: [],
    qualities: [],
    heroes: [],
    exterior_names: [],
    classes: [],
    subcategories: [],
  })

  const pagination = reactive({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  })

  const currencyCode = computed(
    () => currencyStore.currentCurrencyCode || 'EUR',
  )

  const getForcedSpecialOffer = () => {
    if (route.name === 'NewItemsPage') return 'new'
    if (route.name === 'SalePage') return 'sale'
    return ''
  }

  const initializeFilters = () => {
    const q = route.query

    return {
      ...emptyFilterState(),
      search: String(q.search || ''),
      sort: ['asc', 'desc'].includes(q.sort) ? q.sort : DEFAULT_FILTERS.sort,
      page: toPositiveInteger(q.page, DEFAULT_FILTERS.page),
      perPage: toPositiveInteger(q.per_page, DEFAULT_FILTERS.perPage),
      priceRange: {
        min: toNullableNumber(q.price_from),
        max: toNullableNumber(q.price_till),
      },
      type: toArray(q.type),
      quality: toArray(q.quality),
      subcategories: toArray(q.subcategories),
      hero: toArray(q.heroes),
      class: toArray(q.item_class),
      exterior_name: toArray(q.exterior_names),
      special_offer: getForcedSpecialOffer() || String(q.special_offer || ''),
    }
  }

  const filters = reactive(initializeFilters())

  const resetAvailableFilters = () => {
    Object.keys(availableFilters).forEach(key => {
      availableFilters[key] = []
    })
  }

  const buildQueryFromFilters = () => ({
    category: currentCategory.value,

    ...(filters.search && {
      search: filters.search,
    }),

    ...(filters.sort !== DEFAULT_FILTERS.sort && {
      sort: filters.sort,
    }),

    ...(filters.page > 1 && {
      page: String(filters.page),
    }),

    ...(filters.perPage !== DEFAULT_FILTERS.perPage && {
      per_page: String(filters.perPage),
    }),

    ...(filters.priceRange.min != null &&
      filters.priceRange.min !== 0 && {
        price_from: filters.priceRange.min,
      }),

    ...(filters.priceRange.max != null && {
      price_till: filters.priceRange.max,
    }),

    ...(filters.type.length && {
      type: filters.type.join(','),
    }),

    ...(filters.quality.length && {
      quality: filters.quality.join(','),
    }),

    ...(filters.subcategories.length && {
      subcategories: filters.subcategories.join(','),
    }),

    ...(filters.hero.length && {
      heroes: filters.hero.join(','),
    }),

    ...(filters.exterior_name.length && {
      exterior_names: filters.exterior_name.join(','),
    }),

    ...(filters.class.length && {
      item_class: filters.class.join(','),
    }),

    ...(filters.special_offer && {
      special_offer: filters.special_offer,
    }),
  })

  const updateURLQuery = async () => {
    await router.replace({
      path: route.path,
      query: buildQueryFromFilters(),
    })
  }

  let filterRequestId = 0

  const fetchFilterData = async () => {
    const requestId = ++filterRequestId
    const category = currentCategory.value

    try {
      const { data } = await axios.get('/items/filter-data', {
        params: category === 'all' ? {} : { category },
      })

      if (requestId !== filterRequestId) return

      if (data?.status !== 'OK') {
        resetAvailableFilters()
        return
      }

      const toOptions = values =>
        (Array.isArray(values) ? values : []).map(value => ({
          label: value,
          value,
        }))

      availableFilters.types = toOptions(data.payload?.types)
      availableFilters.qualities = toOptions(data.payload?.qualities)
      availableFilters.heroes = toOptions(data.payload?.heroes)
      availableFilters.exterior_names = toOptions(data.payload?.exterior_names)
      availableFilters.classes = toOptions(data.payload?.classes)
    } catch (err) {
      if (requestId !== filterRequestId) return

      console.error('fetchFilterData error:', err)
      resetAvailableFilters()
    }
  }

  let subcategoryRequestId = 0

  const fetchSubcategories = async () => {
    const requestId = ++subcategoryRequestId
    const category = currentCategory.value

    if (category === 'all') {
      availableFilters.subcategories = []
      subcategoriesLoading.value = false
      return
    }

    subcategoriesLoading.value = true

    try {
      const { data } = await axios.get('/items/subcategories', {
        params: { category },
      })

      if (requestId !== subcategoryRequestId) return

      availableFilters.subcategories =
        data?.status === 'OK' && Array.isArray(data.payload) ? data.payload : []
    } catch (err) {
      if (requestId !== subcategoryRequestId) return

      console.error('fetchSubcategories error:', err)
      availableFilters.subcategories = []
    } finally {
      if (requestId === subcategoryRequestId) {
        subcategoriesLoading.value = false
      }
    }
  }

  let productRequestId = 0
  let abortController = null

  const fetchProductsImmediate = async () => {
    const requestId = ++productRequestId

    abortController?.abort()

    const controller = new AbortController()
    abortController = controller

    loading.value = true
    error.value = null

    const params = {
      page: filters.page,
      limit: filters.perPage,
      sort: filters.sort,
      currency: currencyCode.value,

      ...(currentCategory.value !== 'all' && {
        category: currentCategory.value,
      }),

      ...(filters.search && {
        search: filters.search,
      }),

      ...(filters.priceRange.min != null && {
        price_from: filters.priceRange.min,
      }),

      ...(filters.priceRange.max != null && {
        price_till: filters.priceRange.max,
      }),

      ...(filters.type.length && {
        type: filters.type.join(','),
      }),

      ...(filters.quality.length && {
        quality: filters.quality.join(','),
      }),

      ...(filters.subcategories.length && {
        subcategories: filters.subcategories.join(','),
      }),

      ...(filters.hero.length && {
        heroes: filters.hero.join(','),
      }),

      ...(filters.exterior_name.length && {
        exterior_names: filters.exterior_name.join(','),
      }),

      ...(filters.class.length && {
        item_class: filters.class.join(','),
      }),

      ...(filters.special_offer && {
        special_offer: filters.special_offer,
      }),
    }

    try {
      const { data } = await axios.get('/items/list', {
        params,
        timeout: 15000,
        signal: controller.signal,
      })

      if (requestId !== productRequestId) return

      if (data?.status !== 'OK') {
        throw new Error(data?.message || t('Failed to load products.'))
      }

      products.value = Array.isArray(data.payload) ? data.payload : []

      const total = Number(data?.meta?.total ?? products.value.length)

      const page = Number(filters.page) || 1

      const perPage = Number(filters.perPage) || DEFAULT_FILTERS.perPage

      pagination.total = total

      pagination.lastPage =
        Number(data?.meta?.pages) || Math.max(1, Math.ceil(total / perPage))

      pagination.currentPage = page

      pagination.from = total ? (page - 1) * perPage + 1 : 0

      pagination.to = Math.min(page * perPage, total)
    } catch (err) {
      if (requestId !== productRequestId) return

      if (err?.code === 'ERR_CANCELED' || err?.name === 'AbortError') {
        return
      }

      console.error('fetchProducts error:', err)

      if (
        err?.code === 'ECONNABORTED' ||
        String(err?.message).includes('timeout')
      ) {
        error.value = t('Request timeout. Please try again.')
      } else if (err?.response) {
        error.value =
          err.response.data?.message || t('Failed to load products.')
      } else {
        error.value =
          err?.message || t('Network error. Please check your connection.')
      }

      products.value = []

      pagination.total = 0
      pagination.currentPage = 1
      pagination.lastPage = 1
      pagination.from = 0
      pagination.to = 0
    } finally {
      if (requestId === productRequestId) {
        loading.value = false
        ready.value = true
        abortController = null
      }
    }
  }

  const fetchProducts = debounce(fetchProductsImmediate, DEBOUNCE_DELAY)

  const syncFromRouteAndFetch = async () => {
    const requestedCategory = route.query.category || initialCategory

    const newCategory = resolveAllowedGame(requestedCategory)

    const categoryChanged = currentCategory.value !== newCategory

    currentCategory.value = newCategory

    Object.assign(filters, initializeFilters())

    const filtersAreEmpty = Object.values(availableFilters).every(
      values => !values.length,
    )

    if (categoryChanged || filtersAreEmpty) {
      resetAvailableFilters()
      fetchFilterData()
      fetchSubcategories()
    }

    await fetchProductsImmediate()
  }

  const setCategory = async category => {
    const next = normalizeGame(category)

    if (next !== 'all' && !allowedGames.value.includes(next)) {
      return
    }

    if (currentCategory.value === next) return

    currentCategory.value = next

    Object.assign(filters, {
      ...emptyFilterState(),
      special_offer: getForcedSpecialOffer(),
    })

    resetAvailableFilters()

    await updateURLQuery()
  }

  const updateFilters = async next => {
    Object.assign(filters, next)

    if (!Object.prototype.hasOwnProperty.call(next, 'page')) {
      filters.page = 1
    }

    const forcedOffer = getForcedSpecialOffer()

    if (forcedOffer) {
      filters.special_offer = forcedOffer
    }

    const oldPath = route.fullPath

    await updateURLQuery()

    if (route.fullPath === oldPath) {
      await fetchProductsImmediate()
    }
  }

  const resetFilters = async () => {
    Object.assign(filters, {
      ...emptyFilterState(),
      special_offer: getForcedSpecialOffer(),
    })

    const oldPath = route.fullPath

    await updateURLQuery()

    if (route.fullPath === oldPath) {
      await fetchProductsImmediate()
    }
  }

  watch(
    () => route.fullPath,
    () => {
      fetchProducts.cancel()
      syncFromRouteAndFetch()
    },
    { immediate: true },
  )

  watch(
    () => currencyStore.currentCurrencyCode,
    async () => {
      filters.priceRange = {
        min: null,
        max: null,
      }

      filters.page = 1

      const oldPath = route.fullPath

      await updateURLQuery()

      if (route.fullPath === oldPath) {
        await fetchProductsImmediate()
      }
    },
  )

  return {
    SORT_OPTIONS,
    allowedGames,
    isSingleGame,
    isCs2Allowed,
    isDota2Allowed,
    isCs2Only,
    isDota2Only,
    isCs2,
    isDota2,
    products,
    loading,
    subcategoriesLoading,
    error,
    ready,
    filters,
    availableFilters,
    pagination,
    currentGame,
    setCategory,
    updateFilters,
    resetFilters,
    fetchProducts,
    fetchProductsImmediate,
    syncFromRouteAndFetch,
    fetchFilterData,
    fetchSubcategories,
  }
}
