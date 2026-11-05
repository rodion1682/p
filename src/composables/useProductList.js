import axios from '@/plugins/axios'
import { useCurrencyStore } from '@/stores/currency'
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const DEBOUNCE_DELAY = 400
const DEFAULT_CATEGORY = 'rust'

export const SORT_OPTIONS = [
  { value: 'desc', label: 'Sort by Highest first' },
  { value: 'asc', label: 'Sort by Lowest first' },
]

export const PER_PAGE_OPTIONS = [
  { value: 45, label: '45' },
  { value: 30, label: '30' },
  { value: 20, label: '20' },
]

export const DEFAULT_FILTERS = {
  search: '',
  sort: 'desc',
  priceRange: {
    min: null,
    max: null,
  },
  page: 1,
  perPage: 15,

  type: '',
  quality: '',
  subcategories: [],
  hero: [],
  class: [],
  exterior_name: [],

  special_offer: '',
}

export function useProductList(initialCategory = DEFAULT_CATEGORY) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const currencyStore = useCurrencyStore()

  const currentCategory = ref(initialCategory || DEFAULT_CATEGORY)

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

  const normalizeSort = value => {
    return value === 'asc' ? 'asc' : 'desc'
  }

  const getBackendSort = () => {
    return filters.sort === 'asc' ? 'price' : '-price'
  }

  const getForcedSpecialOffer = () => {
    if (route.name === 'NewItemsPage') return 'new'
    if (route.name === 'SalePage') return 'sale'
    return ''
  }

  const getArrayFromQuery = value => {
    if (!value) return []
    return String(value).split(',').filter(Boolean)
  }

  const initializeFilters = () => {
    const q = route.query
    const forcedSpecialOffer = getForcedSpecialOffer()

    return {
      ...DEFAULT_FILTERS,

      search: q.search ? String(q.search) : '',

      sort:
        q.sort === 'price'
          ? 'asc'
          : q.sort === '-price'
            ? 'desc'
            : normalizeSort(q.order || q.sort),

      page: q.page ? Number(q.page) : DEFAULT_FILTERS.page,
      perPage: q.per_page ? Number(q.per_page) : DEFAULT_FILTERS.perPage,

      priceRange: {
        min:
          q.price_from != null && q.price_from !== ''
            ? Number(q.price_from)
            : null,
        max:
          q.price_till != null && q.price_till !== ''
            ? Number(q.price_till)
            : null,
      },

      type: q.type ? String(q.type) : '',
      quality: q.quality ? String(q.quality) : '',

      subcategories: getArrayFromQuery(
        q.subcategories || q['filter[category]'],
      ),

      hero: getArrayFromQuery(q.heroes),
      exterior_name: getArrayFromQuery(q.exterior_names),
      class: getArrayFromQuery(q.item_class),

      special_offer:
        forcedSpecialOffer || (q.special_offer ? String(q.special_offer) : ''),
    }
  }

  const filters = reactive(initializeFilters())

  const resetAvailableFilters = () => {
    availableFilters.types = []
    availableFilters.qualities = []
    availableFilters.heroes = []
    availableFilters.exterior_names = []
    availableFilters.classes = []
    availableFilters.subcategories = []
  }

  const buildQueryFromFilters = () => {
    const query = {
      sort: getBackendSort(),
    }

    if (filters.page > 1) {
      query.page = String(filters.page)
    }

    if (filters.perPage !== DEFAULT_FILTERS.perPage) {
      query.per_page = String(filters.perPage)
    }

    if (filters.search) {
      query.search = filters.search
    }

    if (filters.priceRange.min != null && filters.priceRange.min !== '') {
      query.price_from = String(filters.priceRange.min)
    }

    if (filters.priceRange.max != null && filters.priceRange.max !== '') {
      query.price_till = String(filters.priceRange.max)
    }

    if (filters.subcategories.length) {
      query.subcategories = filters.subcategories.join(',')
    }

    if (filters.type) query.type = filters.type
    if (filters.quality) query.quality = filters.quality

    if (filters.hero.length) {
      query.heroes = filters.hero.join(',')
    }

    if (filters.exterior_name.length) {
      query.exterior_names = filters.exterior_name.join(',')
    }

    if (filters.class.length) {
      query.item_class = filters.class.join(',')
    }

    if (filters.special_offer) {
      query.special_offer = filters.special_offer
    }

    if (currentCategory.value) {
      query.category = currentCategory.value
    }

    return query
  }

  const updateURLQuery = async () => {
    await router.replace({
      path: route.path,
      query: buildQueryFromFilters(),
    })
  }

  const fetchFilterData = async () => {
    resetAvailableFilters()
  }

  const fetchSubcategories = async () => {
    subcategoriesLoading.value = true

    try {
      const { data } = await axios.get('/categories', {
        noParams: true,
      })

      const categories = data?.payload || data?.data || []

      availableFilters.subcategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        value: category.id,
        label: category.name,
      }))
    } catch (e) {
      console.error('fetchCategories error:', e)
      availableFilters.subcategories = []
    } finally {
      subcategoriesLoading.value = false
    }
  }

  let currentRequestId = 0
  let abortController = null
  let isInitialized = false

  const resetPagination = () => {
    pagination.total = 0
    pagination.currentPage = 1
    pagination.lastPage = 1
    pagination.from = 0
    pagination.to = 0
  }

  const applyPagination = data => {
    const meta = data?.meta || {}

    const total = Number(meta.total ?? data?.total ?? 0)
    const currentPage = Number(meta.current_page ?? filters.page ?? 1)
    const lastPage = Number(
      meta.last_page || meta.pages || Math.ceil(total / filters.perPage) || 1,
    )

    pagination.total = total
    pagination.currentPage = currentPage
    pagination.lastPage = lastPage
    pagination.from = total ? (currentPage - 1) * filters.perPage + 1 : 0
    pagination.to = Math.min(currentPage * filters.perPage, total)
  }

  const buildRequestParams = () => {
    const params = {
      page: filters.page,
      per_page: filters.perPage,
      sort: getBackendSort(),
      currency: currencyCode.value,
    }

    if (filters.search) {
      params['filter[name]'] = filters.search
    }

    if (filters.priceRange.min != null && filters.priceRange.min !== '') {
      params.price_from = filters.priceRange.min
    }

    if (filters.priceRange.max != null && filters.priceRange.max !== '') {
      params.price_till = filters.priceRange.max
    }

    if (filters.subcategories.length) {
      params['filter[category]'] = filters.subcategories.join(',')
    }

    if (filters.special_offer) {
      params.special_offer = filters.special_offer
    }

    return params
  }

  const fetchProductsImmediate = async () => {
    const requestId = ++currentRequestId

    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/items', {
        params: buildRequestParams(),
        timeout: 15000,
        signal: abortController.signal,
      })

      if (requestId !== currentRequestId) return

      const items = data?.payload || data?.data || []

      if (Array.isArray(items)) {
        products.value = items
        applyPagination(data)
      } else {
        products.value = []
        resetPagination()
      }
    } catch (err) {
      if (requestId !== currentRequestId) return

      const canceled =
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED'

      if (canceled) return

      console.error('fetchProducts error:', err)

      if (
        err?.code === 'ECONNABORTED' ||
        String(err?.message || '').includes('timeout')
      ) {
        error.value = t('Request timeout. Please try again.')
      } else if (!err?.response) {
        error.value = t('Network error. Please check your connection.')
      } else {
        error.value =
          err.response?.data?.message || t('Failed to load products.')
      }

      products.value = []
      resetPagination()
    } finally {
      if (requestId === currentRequestId) {
        loading.value = false
        abortController = null
        ready.value = true
      }
    }
  }

  const fetchProducts = debounce(fetchProductsImmediate, DEBOUNCE_DELAY)

  const syncFiltersFromRoute = () => {
    if (route.query.category) {
      currentCategory.value = String(route.query.category)
    }

    Object.assign(filters, initializeFilters())
  }

  const setCategory = async newCategory => {
    if (!newCategory || newCategory === currentCategory.value) return

    currentCategory.value = newCategory

    Object.assign(filters, {
      ...DEFAULT_FILTERS,
      special_offer: getForcedSpecialOffer(),
    })

    resetAvailableFilters()

    await updateURLQuery()
  }

  const updateFilters = async newFilters => {
    if (!Object.prototype.hasOwnProperty.call(newFilters, 'page')) {
      filters.page = 1
    }

    Object.assign(filters, newFilters)

    const forcedSpecialOffer = getForcedSpecialOffer()

    if (forcedSpecialOffer) {
      filters.special_offer = forcedSpecialOffer
    }

    filters.sort = normalizeSort(filters.sort)

    await updateURLQuery()
  }

  const resetFilters = async () => {
    Object.assign(filters, {
      ...DEFAULT_FILTERS,
      special_offer: getForcedSpecialOffer(),
    })

    await updateURLQuery()
  }

  onMounted(async () => {
    syncFiltersFromRoute()
    await fetchSubcategories()

    isInitialized = true

    await fetchProductsImmediate()
  })

  watch(
    () => route.fullPath,
    () => {
      if (!isInitialized) return

      syncFiltersFromRoute()
      fetchProductsImmediate()
    },
  )

  watch(
    () => currencyStore.currentCurrencyCode,
    async () => {
      if (!isInitialized) return

      filters.priceRange.min = null
      filters.priceRange.max = null
      filters.page = 1

      await updateURLQuery()
    },
  )

  onBeforeUnmount(() => {
    fetchProducts.cancel?.()

    if (abortController) {
      abortController.abort()
    }
  })

  return {
    SORT_OPTIONS,
    PER_PAGE_OPTIONS,

    products,
    loading,
    subcategoriesLoading,
    error,
    ready,

    filters,
    availableFilters,
    pagination,

    currentGame: computed(() => currentCategory.value),

    setCategory,
    updateFilters,
    resetFilters,

    fetchProducts,
    fetchProductsImmediate,

    fetchFilterData,
    fetchSubcategories,
  }
}
