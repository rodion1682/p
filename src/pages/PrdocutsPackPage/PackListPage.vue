<template>
  <main class="packs-page">
    <div class="packs-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="packs-page__inner _cnt">
      <section class="packs-page__catalog catalog">
        <div class="catalog__top">
          <h1 class="catalog__title _h3">
            {{ $t('Card Packs') }}
          </h1>
        </div>

        <div class="catalog__body">
          <LoadingSpinner v-if="loading" class="catalog__loader" />

          <div v-else-if="error" class="catalog__empty empty">
            <div class="empty__title _h3">
              {{ $t('Unable to load packs') }}
            </div>

            <div class="empty__text">
              {{ error }}
            </div>

            <BaseButton
              type="button"
              variant="hint-bordered"
              class="empty__button"
              @click="reloadCatalog"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <div v-else-if="packs.length" class="catalog__items">
            <div
              v-for="pack in packs"
              :key="pack.id"
              class="catalog__item pack-item"
            >
              <PackCard
                :product="pack"
                class="pack-item__card"
                @open="openPackDetails"
              />
            </div>
          </div>

          <div v-else class="catalog__empty empty">
            <div class="empty__title _h3">
              {{ $t('No packs found') }}
            </div>

            <BaseButton
              type="button"
              variant="hint-bordered"
              class="empty__button"
              @click="resetFilters"
            >
              {{ $t('Clear all') }}
            </BaseButton>
          </div>
        </div>

        <div
          v-if="!loading && packs.length && totalPages > 1"
          class="catalog__pagination pagination"
        >
          <div class="pagination__info">
            {{ $t('Results') }}
            {{ resultStart }}–{{ resultEnd }}
            {{ $t('out of') }}
            {{ pagination.total }}
          </div>

          <PaginationComponent
            class="pagination__component"
            :total-pages="totalPages"
            :current-page="Number(filters.page)"
            :is-small="isMobileView"
            @update:current-page="onPageChange"
          />
        </div>
      </section>

      <aside class="packs-page__aside my-packs">
        <div class="my-packs__top">
          <div class="my-packs__title _h4">
            {{ $t('My Packs') }}
          </div>

          <div
            v-if="false"
            class="my-packs__search"
            :class="{
              'my-packs__search_active':
                isOwnedSearchFocused || ownedSearch.length,
            }"
          >
            <BaseInput
              v-model="ownedSearch"
              class="my-packs__search-input"
              :placeholder="$t('Search')"
              :aria-label="$t('Search my packs')"
              autocomplete="off"
              @focus="isOwnedSearchFocused = true"
              @blur="isOwnedSearchFocused = false"
              @keydown.enter.prevent="applyOwnedSearchImmediately"
            >
              <template #suffix>
                <SvgIcon :icon="SearchIcon" class="my-packs__search-icon" />
              </template>
            </BaseInput>
          </div>
        </div>

        <div class="my-packs__frame">
          <div class="my-packs__body">
            <LoadingSpinner v-if="ownedLoading" class="owned-packs__loader" />

            <div v-else-if="ownedError" class="owned-packs__state">
              <div class="owned-packs__state-title">
                {{ $t('Unable to load your packs') }}
              </div>

              <div class="owned-packs__state-text">
                {{ ownedError }}
              </div>

              <BaseButton
                type="button"
                variant="hint-bordered"
                class="owned-packs__state-button"
                @click="fetchOwnedPacks"
              >
                {{ $t('Try again') }}
              </BaseButton>
            </div>

            <div
              v-else-if="filteredOwnedPacks.length"
              class="owned-packs__items"
            >
              <button
                v-for="pack in filteredOwnedPacks"
                :key="getOwnedPackKey(pack)"
                type="button"
                class="owned-packs__item"
                :aria-label="`${$t('Open')} ${getPackName(pack)}`"
                @click="openUnpackModal(pack)"
              >
                <div class="owned-packs__image">
                  <img :src="getPackImage(pack)" :alt="getPackName(pack)" />
                </div>

                <div class="owned-packs__info">
                  <div class="owned-packs__name">
                    {{ getPackName(pack) }}
                  </div>

                  <div
                    v-if="getPackQuantity(pack) > 1"
                    class="owned-packs__quantity"
                  >
                    ×{{ getPackQuantity(pack) }}
                  </div>
                </div>
              </button>
            </div>

            <div v-else class="owned-packs__state">
              <template v-if="hasAppliedOwnedSearch">
                <div class="owned-packs__state-title">
                  {{ $t('No matching packs found') }}
                </div>

                <div class="owned-packs__state-text">
                  {{ $t('Delete the search value and try another pack name.') }}
                </div>
              </template>

              <template v-else>
                <div class="owned-packs__state-title">
                  {{ $t("You don't have any card packs yet.") }}
                </div>

                <div class="owned-packs__state-text">
                  {{
                    $t(
                      'Purchase a pack to open it and increase your chances of winning.',
                    )
                  }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <PackDetailsModal
      v-model:show="isPackDetailsOpen"
      :pack-id="selectedPackId"
      :initial-pack="selectedPack"
      @close="closePackDetails"
    />

    <UnpackPackModal
      v-model:show="isUnpackModalOpen"
      :pack-id="selectedOwnedPackId"
      :pack="selectedOwnedPack"
      @opened="handlePackOpened"
      @close="closeUnpackModal"
    />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import axios from '@/plugins/axios'

import PackCard from './components/PackCard.vue'
import PackDetailsModal from './modals/PackDetailsModal.vue'
import UnpackPackModal from './modals/UnpackPackModal.vue'

const OWNED_SEARCH_DELAY = 400
const OWNED_PACKS_PER_PAGE = 200

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const isMobileView = useMediaQuery('(max-width: 767.98px)')

const ownedPacks = ref([])
const ownedLoading = ref(true)
const ownedError = ref('')

const ownedSearch = ref('')
const appliedOwnedSearch = ref('')
const isOwnedSearchFocused = ref(false)

const selectedPackId = ref(null)
const selectedPack = ref(null)
const isPackDetailsOpen = ref(false)

const selectedOwnedPackId = ref(null)
const selectedOwnedPack = ref(null)
const isUnpackModalOpen = ref(false)

let ownedSearchTimer = null
let ownedPacksRequestId = 0

const {
  packs,
  loading,
  error,
  filters,
  pagination,
  updateFilters,
  resetFilters: originalResetFilters,
  fetchPacks,
} = useProductList()

const hasAppliedOwnedSearch = computed(() => {
  return appliedOwnedSearch.value.length > 0
})

const totalPages = computed(() => {
  const total = Number(pagination.total) || 0
  const perPage = Math.max(1, Number(filters.perPage) || 1)

  return Math.max(1, Math.ceil(total / perPage))
})

const resultStart = computed(() => {
  if (!packs.value.length || !pagination.total) {
    return 0
  }

  const currentPage = Math.max(1, Number(filters.page) || 1)
  const perPage = Math.max(1, Number(filters.perPage) || packs.value.length)

  return (currentPage - 1) * perPage + 1
})

const resultEnd = computed(() => {
  const total = Number(pagination.total) || 0
  const currentPage = Math.max(1, Number(filters.page) || 1)
  const perPage = Math.max(1, Number(filters.perPage) || packs.value.length)

  return Math.min(currentPage * perPage, total)
})

const onPageChange = page => {
  updateFilters({
    page: Number(page),
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const reloadCatalog = () => {
  fetchPacks()
}

const resetFilters = () => {
  originalResetFilters()
}

const getResponseItems = data => {
  const possibleItems = [
    data?.data,
    data?.payload,
    data?.data?.data,
    data?.payload?.data,
    data?.items,
  ]

  return possibleItems.find(Array.isArray) || []
}

const getResponsePack = response => {
  const data = response?.data

  return data?.data || data?.payload || data || null
}

const getPackId = pack => {
  return (
    pack?.pack_id ??
    pack?.product_id ??
    pack?.pack?.id ??
    pack?.product?.id ??
    pack?.id ??
    null
  )
}

const getPackName = pack => {
  return (
    pack?.pack?.name ??
    pack?.product?.name ??
    pack?.name ??
    pack?.title ??
    'Card Pack'
  )
}

const getPackQuantity = pack => {
  const quantity =
    pack?.quantity ??
    pack?.count ??
    pack?.amount ??
    pack?.instances?.length ??
    pack?.pivot?.quantity ??
    1

  return Math.max(0, Number(quantity) || 0)
}

const getOwnedPackKey = pack => {
  const packId = getPackId(pack)

  if (packId) {
    return `owned-pack-${packId}`
  }

  return (
    pack?.instance_uuid ??
    pack?.inventory_id ??
    pack?.player_pack_id ??
    pack?.id ??
    getPackName(pack)
  )
}

const resolveImageUrl = image => {
  if (!image) {
    return defaultImage
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  if (!STATIC_DOMAIN) {
    return image
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = image.startsWith('/') ? image : `/${image}`

  return `${domain}${path}`
}

const getPackImage = pack => {
  const image =
    pack?.image_details ??
    pack?.pack?.image_details ??
    pack?.product?.image_details ??
    pack?.image ??
    pack?.pack?.image ??
    pack?.product?.image ??
    pack?.image_2 ??
    pack?.pack?.image_2 ??
    pack?.product?.image_2 ??
    pack?.img_url ??
    ''

  return resolveImageUrl(image)
}

const groupOwnedPackInstances = instances => {
  const groupedPacks = new Map()

  instances.forEach(instance => {
    const packId = instance?.pack?.id

    if (!packId) {
      return
    }

    const groupKey = String(packId)
    const existingGroup = groupedPacks.get(groupKey)

    if (existingGroup) {
      existingGroup.quantity += 1
      existingGroup.instances.push(instance)

      return
    }

    groupedPacks.set(groupKey, {
      ...instance,
      pack_id: packId,
      pack: {
        ...instance.pack,
      },
      quantity: 1,
      instances: [instance],
      price: instance?.price_in_game ?? instance?.pack?.price ?? 0,
    })
  })

  return Array.from(groupedPacks.values())
}

const enrichOwnedPack = async pack => {
  const packId = getPackId(pack)

  if (!packId) {
    return pack
  }

  const existingDetailsImage = pack?.image_details ?? pack?.pack?.image_details

  if (existingDetailsImage) {
    return pack
  }

  try {
    const response = await axios.get(`/catalog/packs/${packId}`)
    const details = getResponsePack(response)

    if (!details) {
      return pack
    }

    return {
      ...pack,
      image_details: details.image_details ?? details.image ?? null,
      pack: {
        ...pack.pack,
        ...details,
        id: details.id ?? pack.pack?.id ?? packId,
        image_details:
          details.image_details ?? details.image ?? pack.pack?.image ?? null,
      },
      price: pack.price ?? pack.price_in_game ?? details.price ?? 0,
    }
  } catch (requestError) {
    console.error(`Unable to load details for pack ${packId}:`, requestError)

    return pack
  }
}

const fetchOwnedPacks = async () => {
  const requestId = ++ownedPacksRequestId

  ownedLoading.value = true
  ownedError.value = ''

  try {
    const { data } = await axios.get('/players/me/packs', {
      params: {
        per_page: OWNED_PACKS_PER_PAGE,
      },
    })

    if (requestId !== ownedPacksRequestId) {
      return
    }

    const instances = getResponseItems(data)
    const groupedPacks = groupOwnedPackInstances(instances)
    const enrichedPacks = await Promise.all(groupedPacks.map(enrichOwnedPack))

    if (requestId !== ownedPacksRequestId) {
      return
    }

    ownedPacks.value = enrichedPacks
  } catch (requestError) {
    if (requestId !== ownedPacksRequestId) {
      return
    }

    console.error('Unable to load owned packs:', requestError)

    if (requestError?.response?.status === 401) {
      ownedPacks.value = []
      ownedError.value = ''

      return
    }

    ownedError.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to load your packs'

    ownedPacks.value = []
  } finally {
    if (requestId === ownedPacksRequestId) {
      ownedLoading.value = false
    }
  }
}

const openPackDetails = pack => {
  const packId = getPackId(pack)

  if (!packId) {
    console.error('Cannot open pack details: pack ID is missing', pack)
    return
  }

  selectedPack.value = {
    ...pack,
    ...(pack?.pack || {}),
    id: packId,
    name: getPackName(pack),
    image: pack?.pack?.image ?? pack?.image ?? '',
    image_details: pack?.image_details ?? pack?.pack?.image_details ?? '',
    price: pack?.price ?? pack?.price_in_game ?? pack?.pack?.price ?? 0,
  }

  selectedPackId.value = packId
  isPackDetailsOpen.value = true
}

const closePackDetails = () => {
  isPackDetailsOpen.value = false
  selectedPackId.value = null
  selectedPack.value = null
}

const openUnpackModal = pack => {
  const packId = getPackId(pack)

  if (!packId) {
    console.error('Cannot unpack pack: pack template ID is missing', pack)
    return
  }

  selectedOwnedPackId.value = packId
  selectedOwnedPack.value = pack
  isUnpackModalOpen.value = true
}

const closeUnpackModal = () => {
  isUnpackModalOpen.value = false
  selectedOwnedPackId.value = null
  selectedOwnedPack.value = null
}

const handlePackOpened = async ({ packId, cards }) => {
  console.info(`Pack ${packId} opened`, cards)

  await fetchOwnedPacks()
}

const filteredOwnedPacks = computed(() => {
  const search = appliedOwnedSearch.value.toLocaleLowerCase()

  if (!search) {
    return ownedPacks.value
  }

  return ownedPacks.value.filter(pack => {
    const name = String(getPackName(pack)).toLocaleLowerCase()

    return name.includes(search)
  })
})

const applyOwnedSearch = value => {
  appliedOwnedSearch.value = String(value || '')
    .trim()
    .toLocaleLowerCase()
}

const applyOwnedSearchImmediately = () => {
  if (ownedSearchTimer) {
    window.clearTimeout(ownedSearchTimer)
    ownedSearchTimer = null
  }

  applyOwnedSearch(ownedSearch.value)
}

watch(ownedSearch, value => {
  if (ownedSearchTimer) {
    window.clearTimeout(ownedSearchTimer)
  }

  ownedSearchTimer = window.setTimeout(() => {
    applyOwnedSearch(value)
    ownedSearchTimer = null
  }, OWNED_SEARCH_DELAY)
})

onMounted(() => {
  fetchOwnedPacks()
})

onBeforeUnmount(() => {
  ownedPacksRequestId += 1

  if (ownedSearchTimer) {
    window.clearTimeout(ownedSearchTimer)
    ownedSearchTimer = null
  }
})
</script>

<style lang="scss" scoped>
.packs-page {
  @include adaptiveValue('padding-top', 97, 75);
  @include adaptiveValue('padding-bottom', 40, 25);

  position: relative;

  display: flex;
  flex: 1 1 auto;

  width: 100%;
  min-width: 0;
  min-height: 780px;

  background-color: var(--bg-primary-color);

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    max-height: 915px;

    pointer-events: none;

    img {
      object-position: center top;
    }
  }

  &__inner {
    @include adaptiveValue('gap', 48, 20);

    position: relative;
    z-index: 1;

    display: grid;
    align-items: start;
    grid-template-columns: minmax(0, 1fr) 330px;

    width: 100%;
  }

  &__catalog {
    min-width: 0;
  }

  &__aside {
    min-width: 0;
  }

  @media (max-width: $md3) {
    &__inner {
      display: flex;
      flex-direction: column;
    }

    &__catalog,
    &__aside {
      width: 100%;
    }

    &__aside {
      order: -1;
    }
  }
}

.catalog {
  display: flex;
  flex-direction: column;

  min-width: 0;

  &__top {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 25);
    }
  }

  &__title {
    color: var(--primary-color);
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    min-height: 500px;
  }

  &__loader {
    margin: auto;
  }

  &__items {
    @include adaptiveValue('gap', 64, 20);

    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
  }

  &__item {
    width: 100%;
    max-width: 310px;
  }

  &__empty {
    margin: auto;
  }

  &__pagination {
    @include adaptiveValue('margin-top', 48, 25);
  }

  @media (max-width: $md2) {
    &__items {
      gap: 25px;
    }

    &__item {
      max-width: 280px;
    }
  }

  @media (max-width: $md4) {
    &__item {
      max-width: min(100%, 320px);
    }
  }
}

.pack-item {
  text-align: center;

  &__title {
    color: var(--primary-color);
    font-weight: 500;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__card {
    width: 100%;
  }
}

.my-packs {
  position: sticky;
  top: 90px;

  height: fit-content;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__title {
    color: var(--primary-color);
    font-weight: 500;
    text-transform: none;
  }

  &__search {
    width: 40px;

    transition: width 0.3s ease;

    :deep(.base-input__control) {
      padding-right: 38px;
      padding-left: 10px;

      border-color: transparent;
      background-color: transparent;

      &::placeholder {
        opacity: 0;
      }
    }

    &_active {
      width: 150px;

      :deep(.base-input__control) {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }
    }

    @media (any-hover: hover) {
      &:hover {
        width: 150px;

        :deep(.base-input__control) {
          border-color: var(--border-fourth-color);
          background-color: var(--bg-secondary-color);

          &::placeholder {
            opacity: 1;
          }
        }
      }
    }
  }

  &__search-icon {
    width: 18px;
    min-width: 18px;
    height: 18px;

    color: var(--hint-secondary-color);
  }

  &__frame {
    min-height: 520px;

    border: 1px solid var(--border-secondary-color);
    background-color: rgb(24 28 37 / 84%);
  }

  &__body {
    min-height: 520px;

    padding: 10px;
  }

  @media (max-width: $md3) {
    position: relative;
    top: auto;

    &__frame,
    &__body {
      min-height: 250px;
    }
  }

  @media (max-width: $md5) {
    &__top {
      flex-wrap: wrap;
    }

    &__search,
    &__search_active {
      width: 100%;
    }

    &__search {
      :deep(.base-input__control) {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }
    }
  }
}

.owned-packs {
  &__loader {
    display: flex;

    margin: 50px auto;
  }

  &__items {
    display: flex;
    flex-direction: column;
  }

  &__item {
    display: grid;
    align-items: center;
    gap: 18px;
    grid-template-columns: 82px minmax(0, 1fr);

    width: 100%;

    padding: 10px;

    border: 0;
    background-color: transparent;

    color: inherit;
    text-align: left;

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: rgb(255 255 255 / 3%);

        .owned-packs__image {
          transform: translateY(-3px);
        }

        .owned-packs__name {
          color: var(--primary-color);
        }
      }
    }

    &:focus-visible {
      outline: 1px solid var(--hint-secondary-color);
      outline-offset: -1px;
    }
  }

  &__image {
    width: 82px;
    aspect-ratio: 0.7;

    transition: transform 0.3s ease;

    img {
      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    min-width: 0;
  }

  &__name {
    overflow: hidden;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 140%;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
  }

  &__quantity {
    flex-shrink: 0;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 490px;

    padding: 30px 15px;

    text-align: center;
  }

  &__state-title {
    max-width: 250px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 140%;

    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__state-text {
    max-width: 250px;

    color: var(--secondary-color);
    font-size: 13px;
    line-height: 140%;

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__state-button {
    width: 100%;
    max-width: 180px;
  }

  @media (max-width: $md3) {
    &__items {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &__item {
      grid-template-columns: 70px minmax(0, 1fr);
    }

    &__image {
      width: 70px;
    }

    &__state {
      min-height: 220px;
    }
  }

  @media (max-width: $md4) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md6) {
    &__items {
      grid-template-columns: 1fr;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 350px;

  padding: 30px;

  text-align: center;

  &__title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__text {
    max-width: 420px;

    color: var(--secondary-color);
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__button {
    width: 100%;
    max-width: 210px;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  width: 100%;

  &__info {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__component {
    margin-left: auto;
  }

  @media (max-width: $md5) {
    flex-direction: column;
    align-items: center;

    &__info {
      text-align: center;
    }

    &__component {
      margin-left: 0;
    }
  }
}
</style>
