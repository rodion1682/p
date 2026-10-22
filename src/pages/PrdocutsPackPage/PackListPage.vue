<template>
  <main class="packs-page">
    <div class="packs-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="packs-page__container _cnt">
      <div class="packs-page__inner">
        <aside class="packs-page__aside my-packs">
          <div class="my-packs__top">
            <h2 class="my-packs__title _h6">
              {{ $t('My Packs') }}
            </h2>
          </div>

          <div class="my-packs__body">
            <LoadingSpinner v-if="ownedLoading" class="owned-packs__loader" />

            <div v-else-if="ownedError" class="owned-packs__state">
              <h3 class="owned-packs__state-title">
                {{ $t('Unable to load your packs') }}
              </h3>

              <p class="owned-packs__state-text">
                {{ ownedError }}
              </p>

              <BaseButton
                type="button"
                variant="hint-bordered"
                class="owned-packs__state-button"
                @click="fetchOwnedPacks"
              >
                {{ $t('Try again') }}
              </BaseButton>
            </div>

            <div v-else-if="ownedPacks.length" class="owned-packs__items">
              <button
                v-for="pack in ownedPacks"
                :key="getOwnedPackKey(pack)"
                type="button"
                class="owned-packs__item"
                :aria-label="`${$t('Open')} ${getPackName(pack)}`"
                @click="openUnpackModal(pack)"
              >
                <span class="owned-packs__image">
                  <img
                    :src="getPackImage(pack)"
                    :alt="getPackName(pack)"
                    loading="lazy"
                  />
                </span>

                <span class="owned-packs__info">
                  <span class="owned-packs__name">
                    {{ getPackName(pack) }}
                  </span>

                  <span
                    v-if="getPackQuantity(pack) > 1"
                    class="owned-packs__quantity"
                  >
                    ×{{ getPackQuantity(pack) }}
                  </span>
                </span>

                <span class="owned-packs__arrow" aria-hidden="true"> → </span>
              </button>
            </div>

            <div v-else class="owned-packs__state">
              <p class="owned-packs__state-title">
                {{ $t("You don't have any card packs yet.") }}
              </p>

              <p class="owned-packs__state-text">
                {{
                  $t(
                    'Purchase a pack to open it and increase your chances of winning.',
                  )
                }}
              </p>
            </div>
          </div>
        </aside>

        <!-- Catalog: right content -->
        <section class="packs-page__catalog catalog">
          <div class="catalog__top">
            <h1 class="catalog__title _h4">
              {{ $t('Packs') }}
            </h1>
          </div>

          <div class="catalog__body">
            <LoadingSpinner v-if="loading" class="catalog__loader" />

            <div v-else-if="error" class="catalog__empty empty">
              <h2 class="empty__title _h4">
                {{ $t('Unable to load packs') }}
              </h2>

              <p class="empty__text">
                {{ error }}
              </p>

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
              <PackCard
                v-for="pack in packs"
                :key="getPackId(pack)"
                :product="pack"
                class="catalog__card"
                @open="openPackDetails"
              />
            </div>

            <div v-else class="catalog__empty empty">
              <h2 class="empty__title _h4">
                {{ $t('No packs found') }}
              </h2>

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
      </div>
    </div>

    <!-- Catalog details modal (optional) -->
    <PackDetailsModal
      v-if="IS_PACK_DETAILS_MODAL_ACTIVE"
      v-model:show="isPackDetailsOpen"
      :pack-id="selectedPackId"
      :initial-pack="selectedPack"
      @close="closePackDetails"
    />

    <!-- Owned packs always use the unpack modal -->
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'

import defaultImage from '@/assets/img/default-image.png'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'

import axios from '@/plugins/axios'

import PackCard from './components/PackCard.vue'
import PackDetailsModal from './modals/PackDetailsModal.vue'
import UnpackPackModal from './modals/UnpackPackModal.vue'

// false = navigate to PackDetailsPage
// true  = open PackDetailsModal
const IS_PACK_DETAILS_MODAL_ACTIVE = false

const OWNED_PACKS_PER_PAGE = 200
const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const router = useRouter()

const isMobileView = useMediaQuery('(max-width: 767.98px)')

const ownedPacks = ref([])
const ownedLoading = ref(true)
const ownedError = ref('')

const selectedPackId = ref(null)
const selectedPack = ref(null)
const isPackDetailsOpen = ref(false)

const selectedOwnedPackId = ref(null)
const selectedOwnedPack = ref(null)
const isUnpackModalOpen = ref(false)

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

// Pagination

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

// Pack helpers

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

// Owned packs

const groupOwnedPackInstances = instances => {
  const groupedPacks = new Map()

  instances.forEach(instance => {
    const packId = instance?.pack?.id

    if (!packId) {
      return
    }

    const key = String(packId)
    const existing = groupedPacks.get(key)

    if (existing) {
      existing.quantity += 1
      existing.instances.push(instance)
      return
    }

    groupedPacks.set(key, {
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

  const existingImage = pack?.image_details ?? pack?.pack?.image_details

  if (existingImage) {
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

// Pack details navigation

const openPackDetails = pack => {
  const packId = getPackId(pack)

  if (!packId) {
    console.error('Cannot open pack details: pack ID is missing', pack)
    return
  }

  // Use dedicated page when the modal flag is disabled.
  if (!IS_PACK_DETAILS_MODAL_ACTIVE) {
    router.push({
      name: 'PackDetailsPage',
      params: {
        productId: packId,
      },
    })
    return
  }

  // Preserve the original modal behavior.
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

// Owned pack unpacking

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

onMounted(() => {
  fetchOwnedPacks()
})

onBeforeUnmount(() => {
  ownedPacksRequestId += 1
})
</script>

<style lang="scss" scoped>
.packs-page {
  @include adaptiveValue('padding-top', 110, 80);
  @include adaptiveValue('padding-bottom', 80, 30);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  background: var(--bg-primary-color);

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__container {
    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__inner {
    @include adaptiveValue('column-gap', 36, 16);
    @include adaptiveValue('row-gap', 28, 20);

    display: grid;
    align-items: start;
    grid-template-columns:
      minmax(240px, 0.28fr)
      minmax(0, 0.72fr);

    width: 100%;
    min-width: 0;
  }

  &__catalog,
  &__aside {
    min-width: 0;
  }

  @media (max-width: $md3) {
    &__inner {
      grid-template-columns: minmax(0, 1fr);
    }

    &__aside {
      order: 1;
    }

    &__catalog {
      order: 2;
    }
  }
}

// Catalog

.catalog {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  &__top {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    min-height: 72px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-align: left;
    text-transform: none;
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    min-height: 300px;
  }

  &__loader {
    margin: auto;
  }

  &__items {
    @include adaptiveValue('column-gap', 40, 12);
    @include adaptiveValue('row-gap', 28, 16);

    display: grid;
    align-items: stretch;
    justify-items: center;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;
    min-width: 0;
    max-width: 760px;

    margin: 0 auto;
  }

  &__card {
    width: 100%;
    min-width: 0;
  }

  &__empty {
    margin: auto;
  }

  &__pagination {
    @include adaptiveValue('margin-top', 32, 20);
  }

  // Pack cards: design based on the PNG reference

  :deep(.pack-card) {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    height: 100%;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: rgb(17 22 36 / 45%);
    box-shadow: none;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);
        background: rgb(17 22 36 / 65%);
      }
    }
  }

  :deep(.pack-card__body) {
    @include adaptiveValue('padding', 20, 10);

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;
    height: 100%;

    background: transparent;
  }

  :deep(.pack-card__title) {
    width: 100%;

    margin: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 150%;
    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 8);
    }
  }

  :deep(.pack-card__preview) {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;

    padding: 0;

    border: 0;
    background: transparent;
  }

  :deep(.pack-card__image) {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    aspect-ratio: 0.72;

    background: transparent;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;

      transition: transform 0.3s ease;
    }
  }

  :deep(.pack-card__preview:hover .pack-card__image img) {
    transform: translateY(-5px);
  }

  :deep(.pack-card__footer) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    width: 100%;

    margin-top: 12px;
  }

  :deep(.pack-card__price) {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    min-width: 0;

    margin: 0;

    :deep(.price) {
      gap: 6px;
    }
  }

  :deep(.pack-card__cart) {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 38px;
    min-width: 38px;
    height: 38px;
    min-height: 38px;

    padding: 7px;

    border-radius: 6px;
  }

  :deep(.pack-card__cart-icon) {
    width: 20px;
    height: 20px;
  }

  :deep(.pack-card__cart-text) {
    display: none;
  }

  @media (max-width: $md3) {
    &__top {
      min-height: 0;
    }

    &__items {
      max-width: 650px;
    }
  }

  @media (max-width: $md6) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    :deep(.pack-card__body) {
      padding: 10px;
    }

    :deep(.pack-card__title) {
      font-size: 12px;
    }

    :deep(.pack-card__footer) {
      gap: 6px;
    }

    :deep(.pack-card__cart) {
      width: 34px;
      min-width: 34px;
      height: 34px;
      min-height: 34px;
    }

    :deep(.pack-card__price) {
      :deep(.price__number) {
        font-size: 15px;
      }
    }
  }

  @media (max-width: $md8) {
    &__items {
      grid-template-columns: minmax(0, 1fr);

      max-width: 300px;
    }
  }
}

// My Packs sidebar

.my-packs {
  display: flex;
  flex-direction: column;
  gap: 4px;

  width: 100%;
  min-width: 0;

  &__top {
    @include adaptiveValue('padding', 20, 14);

    display: flex;
    align-items: center;

    min-height: 72px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 10px;
    background: #111624;
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-align: left;
    text-transform: none;
  }

  &__body {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    min-height: 110px;
  }

  @media (max-width: $md3) {
    &__top {
      min-height: 60px;
    }
  }
}

// Owned pack list

.owned-packs {
  &__loader {
    margin: 24px auto;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 4px;

    width: 100%;
    min-width: 0;
  }

  &__item {
    @include adaptiveValue('padding', 14, 10);

    display: grid;
    align-items: center;
    gap: 12px;
    grid-template-columns:
      minmax(42px, 0.2fr)
      minmax(0, 1fr)
      auto;

    width: 100%;
    min-width: 0;
    min-height: 86px;

    border: 1px solid transparent;
    border-radius: 10px;
    background: #111624;

    color: var(--fourth-color);
    text-align: left;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &:focus-visible {
      border-color: var(--hint-primary-color);
      outline: none;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);

        .owned-packs__image img {
          transform: translateY(-3px);
        }

        .owned-packs__arrow {
          color: var(--hint-primary-color);

          transform: translateX(3px);
        }
      }
    }
  }

  &__image {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 60px;
    aspect-ratio: 0.8;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;

      transition: transform 0.3s ease;
    }
  }

  &__info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    min-width: 0;
  }

  &__name {
    min-width: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 600;
    line-height: 150%;
    text-align: left;

    overflow-wrap: anywhere;
  }

  &__quantity {
    flex: 0 0 auto;

    color: var(--hint-primary-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 600;
  }

  &__arrow {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 22px;

    color: var(--fifth-color);
    font-size: 20px;
    line-height: 1;

    transition:
      color 0.3s ease,
      transform 0.3s ease;
  }

  &__state {
    @include adaptiveValue('padding', 24, 16);

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;

    width: 100%;
    min-height: 120px;

    border-radius: 10px;
    background: #111624;
  }

  &__state-title {
    margin: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 600;
    line-height: 150%;
    text-align: left;
  }

  &__state-text {
    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    font-weight: 400;
    line-height: 160%;
    text-align: left;
  }

  &__state-button {
    width: fit-content;
    min-width: 130px;

    margin-top: 6px;
  }

  @media (max-width: $md3) {
    &__items {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md6) {
    &__items {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

// Empty catalog

.empty {
  @include adaptiveValue('padding', 32, 18);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  width: 100%;
  min-height: 280px;

  border: 1px solid var(--border-priamry-color);
  border-radius: 12px;
  background: #111624;

  text-align: center;

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-transform: none;
  }

  &__text {
    max-width: 420px;

    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    line-height: 150%;
  }

  &__button {
    width: fit-content;
    min-width: 150px;
    max-width: 210px;
  }
}

// Pagination

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  width: 100%;
  min-width: 0;

  &__info {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 400;
    line-height: 150%;
  }

  &__component {
    margin-left: auto;
  }

  @media (max-width: $md5) {
    flex-direction: column;
    align-items: center;
    gap: 14px;

    &__info {
      text-align: center;
    }

    &__component {
      margin-left: 0;
    }
  }
}
</style>
