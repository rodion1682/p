import { debounce } from 'lodash'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import axios from '@/plugins/axios'
import { useHeroesStore } from '@/stores/heroes'

const DEBOUNCE_DELAY = 400

const PRODUCT_ROUTE_NAMES = [
  'ProductListPage',
  'ProductListPageWithCategory',
  'SalePage',
  'NewItemsPage',
]

const COLLECTION_ROUTE_NAME = 'MyCardsPage'

const RENTED_COLLECTION_VALUE = 'rented'
const BOUGHT_COLLECTION_VALUE = 'bought'

export const ITEMS_PER_PAGE_OPTIONS = [7, 21, 28]

export const CATALOG_SORT_OPTIONS = [
  {
    value: 'price_asc',
    label: 'Lowest price first',
  },
  {
    value: 'price_desc',
    label: 'Highest price first',
  },
]

export const SORT_OPTIONS = [
  {
    value: 'price_asc',
    label: 'Lowest price first',
  },
  {
    value: 'price_desc',
    label: 'Highest price first',
  },
  {
    value: 'date_asc',
    label: 'Newest first',
  },
  {
    value: 'date_desc',
    label: 'Oldest first',
  },
]

export const COLLECTION_SORT_OPTIONS = [
  {
    value: 'date_asc',
    label: 'Newest first',
  },
  {
    value: 'date_desc',
    label: 'Oldest first',
  },
]

export const DEFAULT_FILTERS = {
  search: '',
  sort: 'price_desc',

  priceRange: {
    min: null,
    max: null,
  },

  page: 1,
  perPage: 18,

  type: '',
  rarity: '',
  frameType: '',
  hero: '',

  exterior_name: [],
  class: [],

  sale: false,
  new: false,

  rentalStatus: '',
}

const createDefaultFilters = () => ({
  ...DEFAULT_FILTERS,

  priceRange: {
    ...DEFAULT_FILTERS.priceRange,
  },

  exterior_name: [],
  class: [],
})

const normalizeCollectionMode = value => {
  return value === RENTED_COLLECTION_VALUE
    ? RENTED_COLLECTION_VALUE
    : BOUGHT_COLLECTION_VALUE
}

const normalizePage = value => {
  const page = Number(value)

  if (!Number.isFinite(page) || page < 1) {
    return 1
  }

  return Math.floor(page)
}

const normalizePerPage = value => {
  const perPage = Number(value)

  return ITEMS_PER_PAGE_OPTIONS.includes(perPage)
    ? perPage
    : DEFAULT_FILTERS.perPage
}

const normalizePrice = value => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const price = Number(value)

  if (!Number.isFinite(price)) {
    return null
  }

  return Math.max(0, price)
}

const normalizeCatalogSort = value => {
  const option = CATALOG_SORT_OPTIONS.find(item => {
    return item.value === value
  })

  return option?.value || DEFAULT_FILTERS.sort
}

const normalizeCollectionSort = value => {
  const option = COLLECTION_SORT_OPTIONS.find(item => {
    return item.value === value
  })

  return option?.value || COLLECTION_SORT_OPTIONS[0].value
}

const normalizeQueryString = value => {
  return typeof value === 'string' ? value : ''
}

const normalizeRentalProduct = rental => {
  if (!rental) {
    return null
  }

  const originalRentalId = rental.rental_id ?? rental.id ?? null

  const cardId = rental.card_id ?? rental.card?.id ?? null

  if (!cardId) {
    console.warn('Rental item has no card ID:', rental)
  }

  return {
    ...rental,

    rental_id: originalRentalId,

    id: cardId,
    card_id: cardId,

    name: rental.card_name ?? rental.card?.name ?? rental.name ?? '',

    description:
      rental.card_description ??
      rental.card?.description ??
      rental.description ??
      '',

    image: rental.card_image ?? rental.card?.image ?? rental.image ?? null,

    image_2:
      rental.card_image_2 ?? rental.card?.image_2 ?? rental.image_2 ?? null,

    mana_cost: rental.mana_cost ?? rental.card?.mana_cost ?? null,

    attack: rental.attack ?? rental.card?.attack ?? null,

    health: rental.health ?? rental.card?.health ?? null,

    rarity: rental.rarity ?? rental.card?.rarity ?? '',

    type: rental.type ?? rental.card?.type ?? '',

    hero: rental.hero ?? rental.card?.hero ?? null,

    hero_id:
      rental.hero_id ?? rental.card?.hero_id ?? rental.card?.hero?.id ?? null,

    frame_type: rental.frame_type ?? rental.card?.frame_type ?? null,

    card_frame_set_id:
      rental.card_frame_set_id ??
      rental.card?.card_frame_set_id ??
      rental.frame_type?.id ??
      rental.card?.frame_type?.id ??
      null,

    price: rental.rental_price_game ?? rental.price ?? 0,

    sale_price: null,

    quantity: 1,

    is_rented: true,

    rental_period: rental.rental_period ?? null,

    rental_price: rental.rental_price_game ?? rental.price ?? 0,

    rental_status: rental.status ?? '',

    rented_at: rental.rented_at ?? null,

    expires_at: rental.expires_at ?? null,

    expired_at: rental.expired_at ?? null,

    rental: {
      id: originalRentalId,

      period: rental.rental_period ?? null,

      price: rental.rental_price_game ?? rental.price ?? 0,

      status: rental.status ?? '',

      rented_at: rental.rented_at ?? null,

      expires_at: rental.expires_at ?? null,

      expired_at: rental.expired_at ?? null,
    },

    original_rental: rental,
  }
}

export function useProductList() {
  const route = useRoute()
  const router = useRouter()

  const heroesStore = useHeroesStore()

  const products = ref([])
  const packs = ref([])

  const myProducts = ref([])
  const myRentProducts = ref([])
  const myPacks = ref([])

  const loading = ref(true)
  const error = ref(null)

  const initialized = ref(false)

  const isUpdatingFilters = ref(false)

  const marketMode = ref(route.query.mode === 'rent' ? 'rent' : 'buy')

  const collectionMode = computed(() => {
    if (route.name !== COLLECTION_ROUTE_NAME) {
      return BOUGHT_COLLECTION_VALUE
    }

    return normalizeCollectionMode(route.query.collection)
  })

  const isRentedCollection = computed(() => {
    return collectionMode.value === RENTED_COLLECTION_VALUE
  })

  const collectionProducts = computed(() => {
    if (isRentedCollection.value) {
      return myRentProducts.value
    }

    return myProducts.value
  })

  const availableFilters = reactive({
    types: [],
    rarities: [],
    frameTypes: [],
    hero: [],
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

  const initializeFilters = () => {
    const query = route.query

    const selectedHero = heroesStore.heroes?.find(hero => {
      return hero.slug === query.hero
    })

    const isCollectionRoute = route.name === COLLECTION_ROUTE_NAME

    return {
      ...createDefaultFilters(),

      search: normalizeQueryString(query.search),

      sort: isCollectionRoute
        ? normalizeCollectionSort(query.sort)
        : normalizeCatalogSort(query.sort),

      page: normalizePage(query.page),

      perPage: normalizePerPage(query.per_page),

      priceRange: {
        min: normalizePrice(query.min_price),

        max: normalizePrice(query.max_price),
      },

      type: normalizeQueryString(query.type),

      rarity: normalizeQueryString(query.rarity),

      frameType: normalizeQueryString(query.frame_type),

      hero: selectedHero?.id || '',

      exterior_name:
        typeof query.exterior_names === 'string'
          ? query.exterior_names.split(',').filter(Boolean)
          : [],

      class:
        typeof query.item_class === 'string'
          ? query.item_class.split(',').filter(Boolean)
          : [],

      sale: route.name === 'SalePage' || query.sale === 'true',

      new: route.name === 'NewItemsPage' || query.new === 'true',

      rentalStatus: normalizeQueryString(query.status),
    }
  }

  const filters = reactive(initializeFilters())

  const requestIds = reactive({
    products: 0,
    packs: 0,
    myProducts: 0,
    myRentProducts: 0,
    myPacks: 0,
  })

  const resetPagination = () => {
    pagination.total = 0
    pagination.currentPage = 1
    pagination.lastPage = 1
    pagination.from = 0
    pagination.to = 0
  }

  const updatePagination = (meta = {}, items = []) => {
    const total = Number(meta?.total ?? meta?.pagination?.total ?? items.length)

    const currentPage = Number(
      meta?.current_page ??
        meta?.currentPage ??
        meta?.pagination?.current_page ??
        filters.page,
    )

    const metaPerPage = Number(
      meta?.per_page ??
        meta?.perPage ??
        meta?.pagination?.per_page ??
        filters.perPage,
    )

    const effectivePerPage =
      Number.isFinite(metaPerPage) && metaPerPage > 0
        ? metaPerPage
        : filters.perPage

    const lastPage = Number(
      meta?.last_page ??
        meta?.lastPage ??
        meta?.pagination?.last_page ??
        Math.max(Math.ceil(total / effectivePerPage), 1),
    )

    pagination.total = Number.isFinite(total) && total >= 0 ? total : 0

    pagination.currentPage = normalizePage(currentPage)

    pagination.lastPage =
      Number.isFinite(lastPage) && lastPage >= 1 ? Math.floor(lastPage) : 1

    if (pagination.total === 0) {
      pagination.from = 0
      pagination.to = 0

      return
    }

    pagination.from = Number(
      meta?.from ??
        meta?.pagination?.from ??
        (pagination.currentPage - 1) * effectivePerPage + 1,
    )

    pagination.to = Number(
      meta?.to ??
        meta?.pagination?.to ??
        Math.min(pagination.currentPage * effectivePerPage, pagination.total),
    )
  }

  const getResponseItems = (data, preferredKey = 'data') => {
    if (Array.isArray(data?.[preferredKey])) {
      return data[preferredKey]
    }

    if (Array.isArray(data?.data)) {
      return data.data
    }

    if (Array.isArray(data?.payload)) {
      return data.payload
    }

    if (Array.isArray(data?.payload?.data)) {
      return data.payload.data
    }

    return []
  }

  const getResponseMeta = data => {
    return (
      data?.meta ??
      data?.payload?.meta ??
      data?.pagination ??
      data?.payload?.pagination ??
      {}
    )
  }

  const getCatalogCardParams = () => ({
    page: filters.page,

    per_page: filters.perPage,

    sort: filters.sort,

    name: filters.search.trim() || undefined,

    min_price: filters.priceRange.min ?? undefined,

    max_price: filters.priceRange.max ?? undefined,

    hero_id: filters.hero || undefined,

    type: filters.type || undefined,

    rarity: filters.rarity || undefined,

    card_frame_set_id: filters.frameType || undefined,
  })

  const getCatalogPackParams = () => ({
    page: filters.page,

    per_page: filters.perPage,

    sort: filters.sort,

    name: filters.search.trim() || undefined,

    min_price: filters.priceRange.min ?? undefined,

    max_price: filters.priceRange.max ?? undefined,
  })

  const getInventoryParams = () => ({
    page: filters.page,

    per_page: filters.perPage,

    sort: filters.sort,
  })

  const getMyRentalParams = () => ({
    page: filters.page,

    status: filters.rentalStatus || undefined,
  })

  const mapFilterValues = values => {
    if (!Array.isArray(values)) {
      return []
    }

    return values.map(value => {
      if (value && typeof value === 'object') {
        return {
          label: value.name ?? value.label ?? value.value ?? '',

          value: value.value ?? value.slug ?? value.id ?? value.name ?? '',
        }
      }

      return {
        label: value,
        value,
      }
    })
  }

  const fetchFilterData = async () => {
    const requests = [
      axios.get('/card-rarities').then(({ data }) => {
        const values = data?.payload ?? data?.data ?? []

        availableFilters.rarities = mapFilterValues(values)
      }),

      axios.get('/card-types').then(({ data }) => {
        const values = data?.payload ?? data?.data ?? []

        availableFilters.types = mapFilterValues(values)
      }),

      axios.get('/card-frame-types').then(({ data }) => {
        const values = data?.payload ?? data?.data ?? []

        availableFilters.frameTypes = Array.isArray(values)
          ? values.map(item => ({
              label: item?.name ?? item?.label ?? '',

              value: String(item?.id ?? item?.value ?? ''),
            }))
          : []
      }),
    ]

    const results = await Promise.allSettled(requests)

    results.forEach(result => {
      if (result.status === 'rejected') {
        console.error('Failed to load filter data:', result.reason)
      }
    })
  }

  const fetchProducts = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.products

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/catalog/cards', {
        params: getCatalogCardParams(),
      })

      if (requestId !== requestIds.products) {
        return
      }

      const receivedProducts = getResponseItems(data, 'data')

      products.value = receivedProducts

      updatePagination(getResponseMeta(data), receivedProducts)
    } catch (requestError) {
      if (requestId !== requestIds.products) {
        return
      }

      console.error('Failed to load card catalog:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load products'

      products.value = []

      resetPagination()
    } finally {
      if (requestId === requestIds.products) {
        loading.value = false
      }
    }
  }

  const fetchPacks = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.packs

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/catalog/packs', {
        params: getCatalogPackParams(),
      })

      if (requestId !== requestIds.packs) {
        return
      }

      const receivedPacks = getResponseItems(data, 'data')

      packs.value = receivedPacks

      updatePagination(getResponseMeta(data), receivedPacks)
    } catch (requestError) {
      if (requestId !== requestIds.packs) {
        return
      }

      console.error('Failed to load pack catalog:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load packs'

      packs.value = []

      resetPagination()
    } finally {
      if (requestId === requestIds.packs) {
        loading.value = false
      }
    }
  }

  const fetchMyProducts = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.myProducts

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/players/me/cards', {
        params: getInventoryParams(),
      })

      if (requestId !== requestIds.myProducts) {
        return
      }

      const receivedProducts = getResponseItems(data, 'data')

      myProducts.value = receivedProducts

      updatePagination(getResponseMeta(data), receivedProducts)
    } catch (requestError) {
      if (requestId !== requestIds.myProducts) {
        return
      }

      console.error('Failed to load owned cards:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load owned cards'

      myProducts.value = []

      resetPagination()
    } finally {
      if (requestId === requestIds.myProducts) {
        loading.value = false
      }
    }
  }

  const fetchMyRentProducts = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.myRentProducts

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/rentals', {
        params: getMyRentalParams(),
      })

      if (requestId !== requestIds.myRentProducts) {
        return
      }

      const receivedRentals = getResponseItems(data, 'payload')

      const normalizedRentals = receivedRentals
        .map(normalizeRentalProduct)
        .filter(Boolean)

      myRentProducts.value = normalizedRentals

      updatePagination(getResponseMeta(data), normalizedRentals)
    } catch (requestError) {
      if (requestId !== requestIds.myRentProducts) {
        return
      }

      console.error('Failed to load rentals:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load rentals'

      myRentProducts.value = []

      resetPagination()
    } finally {
      if (requestId === requestIds.myRentProducts) {
        loading.value = false
      }
    }
  }

  const fetchMyPacks = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.myPacks

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/players/me/packs', {
        params: getInventoryParams(),
      })

      if (requestId !== requestIds.myPacks) {
        return
      }

      const receivedPacks = getResponseItems(data, 'data')

      myPacks.value = receivedPacks

      updatePagination(getResponseMeta(data), receivedPacks)
    } catch (requestError) {
      if (requestId !== requestIds.myPacks) {
        return
      }

      console.error('Failed to load owned packs:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load owned packs'

      myPacks.value = []

      resetPagination()
    } finally {
      if (requestId === requestIds.myPacks) {
        loading.value = false
      }
    }
  }

  const debouncedFetchProducts = debounce(fetchProducts, DEBOUNCE_DELAY)

  const debouncedFetchPacks = debounce(fetchPacks, DEBOUNCE_DELAY)

  const debouncedFetchMyProducts = debounce(fetchMyProducts, DEBOUNCE_DELAY)

  const debouncedFetchMyRentProducts = debounce(
    fetchMyRentProducts,
    DEBOUNCE_DELAY,
  )

  const debouncedFetchMyPacks = debounce(fetchMyPacks, DEBOUNCE_DELAY)

  const cancelDebouncedRequests = () => {
    debouncedFetchProducts.cancel()
    debouncedFetchPacks.cancel()
    debouncedFetchMyProducts.cancel()
    debouncedFetchMyRentProducts.cancel()
    debouncedFetchMyPacks.cancel()
  }

  const invalidateAllRequests = () => {
    requestIds.products += 1
    requestIds.packs += 1
    requestIds.myProducts += 1
    requestIds.myRentProducts += 1
    requestIds.myPacks += 1
  }

  const invalidateInactiveCollectionRequest = () => {
    if (isRentedCollection.value) {
      debouncedFetchMyProducts.cancel()

      requestIds.myProducts += 1

      return
    }

    debouncedFetchMyRentProducts.cancel()

    requestIds.myRentProducts += 1
  }

  const clearCurrentCollection = () => {
    if (isRentedCollection.value) {
      myRentProducts.value = []

      return
    }

    myProducts.value = []
  }

  const fetchCollectionProducts = ({ debounced = true } = {}) => {
    invalidateInactiveCollectionRequest()

    if (isRentedCollection.value) {
      if (debounced) {
        debouncedFetchMyRentProducts()

        return
      }

      return fetchMyRentProducts()
    }

    if (debounced) {
      debouncedFetchMyProducts()

      return
    }

    return fetchMyProducts()
  }

  const createQuery = () => {
    const selectedHero = heroesStore.heroes?.find(hero => {
      return String(hero.id) === String(filters.hero)
    })

    const isCatalogRoute = PRODUCT_ROUTE_NAMES.includes(route.name)

    const isCollectionRoute = route.name === COLLECTION_ROUTE_NAME

    return {
      ...(isCollectionRoute && isRentedCollection.value
        ? {
            collection: RENTED_COLLECTION_VALUE,
          }
        : {}),

      ...(isCatalogRoute && marketMode.value === 'rent'
        ? {
            mode: 'rent',
          }
        : {}),

      ...(filters.sort &&
      ((isCollectionRoute &&
        filters.sort !== COLLECTION_SORT_OPTIONS[0].value) ||
        (!isCollectionRoute && filters.sort !== DEFAULT_FILTERS.sort))
        ? {
            sort: filters.sort,
          }
        : {}),

      ...(filters.perPage !== DEFAULT_FILTERS.perPage
        ? {
            per_page: String(filters.perPage),
          }
        : {}),

      ...(filters.priceRange.min !== null && filters.priceRange.min > 0
        ? {
            min_price: String(filters.priceRange.min),
          }
        : {}),

      ...(filters.priceRange.max !== null
        ? {
            max_price: String(filters.priceRange.max),
          }
        : {}),

      ...(filters.type
        ? {
            type: filters.type,
          }
        : {}),

      ...(filters.rarity
        ? {
            rarity: filters.rarity,
          }
        : {}),

      ...(filters.frameType
        ? {
            frame_type: filters.frameType,
          }
        : {}),

      ...(selectedHero?.slug
        ? {
            hero: selectedHero.slug,
          }
        : {}),

      ...(filters.page > 1
        ? {
            page: String(filters.page),
          }
        : {}),

      ...(filters.search.trim()
        ? {
            search: filters.search.trim(),
          }
        : {}),

      ...(filters.new
        ? {
            new: 'true',
          }
        : {}),

      ...(filters.sale
        ? {
            sale: 'true',
          }
        : {}),

      ...(isCollectionRoute && isRentedCollection.value && filters.rentalStatus
        ? {
            status: filters.rentalStatus,
          }
        : {}),
    }
  }

  const updateURL = async () => {
    await router.replace({
      name: route.name,

      params: route.params,

      query: createQuery(),
    })
  }

  const fetchForCurrentRoute = ({ debounced = true } = {}) => {
    const routeName = route.name

    if (PRODUCT_ROUTE_NAMES.includes(routeName)) {
      if (debounced) {
        debouncedFetchProducts()

        return
      }

      return fetchProducts()
    }

    if (routeName === 'PackListPage') {
      if (debounced) {
        debouncedFetchPacks()

        return
      }

      return fetchPacks()
    }

    if (routeName === COLLECTION_ROUTE_NAME) {
      return fetchCollectionProducts({
        debounced,
      })
    }

    if (routeName === 'ProductDetailsPage') {
      if (debounced) {
        debouncedFetchMyProducts()

        return
      }

      return fetchMyProducts()
    }

    if (routeName === 'MyPacksPage' || routeName === 'PackDetailsPage') {
      if (debounced) {
        debouncedFetchMyPacks()

        return
      }

      return fetchMyPacks()
    }

    return Promise.resolve()
  }

  const updateFilters = async (newFilters = {}) => {
    isUpdatingFilters.value = true

    try {
      const nextFilters = {
        ...newFilters,
      }

      if (Object.prototype.hasOwnProperty.call(nextFilters, 'perPage')) {
        nextFilters.perPage = normalizePerPage(nextFilters.perPage)
      }

      if (Object.prototype.hasOwnProperty.call(nextFilters, 'page')) {
        nextFilters.page = normalizePage(nextFilters.page)
      } else {
        filters.page = 1
      }

      if (Object.prototype.hasOwnProperty.call(nextFilters, 'search')) {
        nextFilters.search = String(nextFilters.search ?? '')
      }

      const preservedSpecialFilters = {
        sale: filters.sale,

        new: filters.new,
      }

      if (nextFilters.priceRange) {
        Object.assign(filters.priceRange, {
          min: normalizePrice(nextFilters.priceRange.min),

          max: normalizePrice(nextFilters.priceRange.max),
        })

        delete nextFilters.priceRange
      }

      Object.assign(filters, nextFilters, preservedSpecialFilters)

      filters.perPage = normalizePerPage(filters.perPage)

      filters.page = normalizePage(filters.page)

      await updateURL()

      fetchForCurrentRoute({
        debounced: true,
      })
    } catch (updateError) {
      console.error('Failed to update filters:', updateError)

      error.value = 'Failed to update filters'
    } finally {
      isUpdatingFilters.value = false
    }
  }

  const setMarketMode = async mode => {
    if (!['buy', 'rent'].includes(mode) || marketMode.value === mode) {
      return
    }

    marketMode.value = mode

    filters.page = 1

    error.value = null
    loading.value = true

    await updateURL()

    debouncedFetchProducts.cancel()

    requestIds.products += 1

    await fetchProducts()
  }

  const resetFilters = async () => {
    const nextFilters = createDefaultFilters()

    nextFilters.sale = route.name === 'SalePage'

    nextFilters.new = route.name === 'NewItemsPage'

    if (route.name === COLLECTION_ROUTE_NAME) {
      nextFilters.sort = COLLECTION_SORT_OPTIONS[0].value
    }

    Object.assign(filters, nextFilters)

    await updateFilters({
      page: 1,
      perPage: DEFAULT_FILTERS.perPage,
    })
  }

  watch(
    () => route.query.mode,

    mode => {
      marketMode.value = mode === 'rent' ? 'rent' : 'buy'
    },
  )

  watch(
    () => route.query.collection,

    async (collection, previousCollection) => {
      if (
        !initialized.value ||
        route.name !== COLLECTION_ROUTE_NAME ||
        collection === previousCollection
      ) {
        return
      }

      filters.page = 1

      filters.rentalStatus = normalizeQueryString(route.query.status)

      filters.sort = normalizeCollectionSort(route.query.sort)

      error.value = null
      loading.value = true

      debouncedFetchMyProducts.cancel()
      debouncedFetchMyRentProducts.cancel()

      requestIds.myProducts += 1
      requestIds.myRentProducts += 1

      clearCurrentCollection()

      resetPagination()

      try {
        await fetchCollectionProducts({
          debounced: false,
        })
      } finally {
        loading.value = false
      }
    },
  )

  watch(
    () => route.name,

    async (routeName, previousRouteName) => {
      if (!initialized.value || routeName === previousRouteName) {
        return
      }

      filters.sale = routeName === 'SalePage'

      filters.new = routeName === 'NewItemsPage'

      filters.page = normalizePage(route.query.page)

      filters.perPage = normalizePerPage(route.query.per_page)

      if (routeName === COLLECTION_ROUTE_NAME) {
        filters.sort = normalizeCollectionSort(route.query.sort)

        filters.rentalStatus = normalizeQueryString(route.query.status)
      } else {
        filters.sort = normalizeCatalogSort(route.query.sort)
      }

      error.value = null
      loading.value = true

      cancelDebouncedRequests()
      invalidateAllRequests()

      resetPagination()

      if (routeName === COLLECTION_ROUTE_NAME) {
        clearCurrentCollection()
      }

      try {
        await fetchForCurrentRoute({
          debounced: false,
        })
      } finally {
        loading.value = false
      }
    },
  )

  watch(
    () => route.params.category,

    (category, previousCategory) => {
      if (!initialized.value || category === previousCategory) {
        return
      }

      filters.page = 1

      loading.value = true

      debouncedFetchProducts()
    },
  )

  watch(
    () => heroesStore.heroes,

    heroes => {
      if (filters.hero || !route.query.hero || !heroes?.length) {
        return
      }

      const selectedHero = heroes.find(hero => {
        return hero.slug === route.query.hero
      })

      if (selectedHero) {
        filters.hero = selectedHero.id
      }
    },

    {
      deep: true,
    },
  )

  onMounted(async () => {
    initialized.value = true
    loading.value = true

    filters.page = normalizePage(route.query.page)

    filters.perPage = normalizePerPage(route.query.per_page)

    if (route.name === COLLECTION_ROUTE_NAME) {
      filters.sort = normalizeCollectionSort(route.query.sort)

      filters.rentalStatus = normalizeQueryString(route.query.status)

      clearCurrentCollection()
    }

    try {
      await Promise.all([
        fetchFilterData(),

        fetchForCurrentRoute({
          debounced: false,
        }),
      ])
    } finally {
      loading.value = false
    }
  })

  onBeforeUnmount(() => {
    initialized.value = false

    cancelDebouncedRequests()
    invalidateAllRequests()
  })

  return {
    SORT_OPTIONS,
    CATALOG_SORT_OPTIONS,
    COLLECTION_SORT_OPTIONS,
    ITEMS_PER_PAGE_OPTIONS,

    marketMode,
    setMarketMode,

    collectionMode,
    isRentedCollection,
    collectionProducts,

    products,
    packs,

    myProducts,
    myRentProducts,
    myPacks,

    loading,
    error,
    initialized,
    isUpdatingFilters,

    filters,
    availableFilters,
    pagination,

    updateFilters,
    resetFilters,

    fetchFilterData,

    fetchProducts: debouncedFetchProducts,

    fetchPacks: debouncedFetchPacks,

    fetchMyProducts: debouncedFetchMyProducts,

    fetchMyRentProducts: debouncedFetchMyRentProducts,

    fetchCollectionProducts,

    fetchMyPacks: debouncedFetchMyPacks,
  }
}
