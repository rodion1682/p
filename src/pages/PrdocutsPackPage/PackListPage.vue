<template>
  <main class="packs-page">
    <div class="packs-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="packs-page__container _cnt">
      <div class="packs-page__decoration" aria-hidden="true">
        <img src="@/assets/img/product-list-decor.png" alt="" />
      </div>

      <div class="packs-page__inner">
        <div class="packs-page__catalog catalog">
          <div class="catalog__top">
            <h1 class="catalog__title _h3">
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
                :key="pack.id"
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
        </div>

        <aside class="packs-page__aside my-packs">
          <div class="my-packs__top">
            <h2 class="my-packs__title _h4">
              {{ $t('My Packs') }}
            </h2>
          </div>

          <div class="my-packs__frame">
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
          </div>
        </aside>
      </div>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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

const OWNED_PACKS_PER_PAGE = 200
const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

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

onMounted(() => {
  fetchOwnedPacks()
})

onBeforeUnmount(() => {
  ownedPacksRequestId += 1
})
</script>

<style lang="scss" scoped>
.packs-page {
  @include adaptiveValue('padding-top', 78, 60);
  @include adaptiveValue('padding-bottom', 44, 28);

  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 auto;

  width: 100%;
  min-width: 0;
  min-height: 550px;

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

  &__container {
    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__decoration {
    position: relative;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    width: 100%;
    height: 32px;

    margin-bottom: 20px;

    border-bottom: 1px solid var(--border-priamry-color);

    img {
      position: absolute;
      bottom: 0;
      left: 50%;

      display: block;

      width: min(250px, 55vw);
      max-height: 50px;

      object-fit: contain;
      object-position: center bottom;

      transform: translateX(-50%);
    }
  }

  &__inner {
    @include adaptiveValue('gap', 45, 20);

    display: grid;
    align-items: start;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);

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
      width: 100%;
    }
  }

  @media (max-width: $md4) {
    &__decoration {
      height: 25px;

      margin-bottom: 18px;

      img {
        max-height: 36px;
      }
    }
  }
}

.catalog {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  .catalog {
    &__top {
      position: relative;
      left: calc((330px + 45px) / 2);

      width: 100%;

      text-align: center;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 34, 22);
      }
    }

    @media (max-width: $md2) {
      &__top {
        left: calc((330px + 20px) / 2);
      }
    }

    @media (max-width: $md3) {
      &__top {
        left: 0;
      }
    }
  }

  &__title {
    @include adaptiveValue('font-size', 32, 26);

    margin: 0;

    color: var(--primary-color);
    font-weight: 500;
    line-height: 1.2;
    text-transform: none;
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-height: 340px;
  }

  &__loader {
    margin: auto;
  }

  &__items {
    @include adaptiveValue('column-gap', 60, 16);
    @include adaptiveValue('row-gap', 30, 20);

    position: relative;
    left: 0;

    display: grid;
    align-items: start;
    justify-content: center;
    grid-template-columns: repeat(2, minmax(0, 230px));

    width: 100%;
    max-width: 520px;

    margin: 0 auto;
  }

  @media (min-width: 1600px) {
    &__items {
      left: calc((330px + 45px) / 2);
    }
  }

  @media (max-width: $md2) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 205px));

      max-width: 430px;
    }
  }

  @media (max-width: $md3) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 230px));

      max-width: 520px;
    }
  }

  @media (max-width: $md6) {
    &__items {
      column-gap: 14px;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      max-width: 100%;
    }
  }

  @media (max-width: 359.98px) {
    &__items {
      grid-template-columns: minmax(0, 220px);

      max-width: 220px;
    }
  }

  &__card {
    width: 100%;
    min-width: 0;
  }

  &__empty {
    margin: auto;
  }

  &__pagination {
    @include adaptiveValue('margin-top', 35, 22);
  }

  :deep(.pack-card) {
    width: 100%;
    max-width: none;

    border: 0;
    background: transparent;
    box-shadow: none;
  }

  :deep(.pack-card__body) {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;

    padding: 0;

    background: transparent;
  }

  :deep(.pack-card__title) {
    order: 2;

    width: 100%;

    margin: 0;
    margin-top: 14px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
    text-align: center;
    text-transform: none;
  }

  :deep(.pack-card__preview) {
    display: block;
    order: 1;

    width: 100%;

    padding: 0;

    border: 0;
    background: transparent;
  }

  :deep(.pack-card__image) {
    display: flex;
    overflow: visible;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: auto;
    aspect-ratio: 0.75;

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
    flex-direction: column;
    align-items: center;
    order: 3;
    gap: 10px;

    width: 100%;

    margin-top: 12px;
  }

  :deep(.pack-card__price) {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    margin: 0;
  }

  :deep(.pack-card__cart) {
    width: 100%;
    max-width: 180px;
  }

  @media (max-width: $md2) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 205px));
    }
  }

  @media (max-width: $md3) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 230px));
    }
  }

  @media (max-width: $md6) {
    &__items {
      column-gap: 14px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    :deep(.pack-card__title) {
      font-size: 13px;
    }
  }

  @media (max-width: 359.98px) {
    &__items {
      grid-template-columns: minmax(0, 220px);
    }
  }
}

.my-packs {
  position: relative;

  width: 100%;
  min-width: 0;

  &__top {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 39px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14);
    }
  }

  &__title {
    @include adaptiveValue('font-size', 24, 21);

    margin: 0;

    color: var(--primary-color);
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    text-transform: none;
  }

  &__frame {
    @include adaptiveValue('min-height', 385, 270);

    overflow: hidden;

    width: 100%;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: rgb(51 46 91 / 75%);
  }

  &__body {
    @include adaptiveValue('min-height', 383, 268);

    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 15px;
  }

  @media (max-width: $md3) {
    &__frame,
    &__body {
      min-height: 220px;
    }
  }
}

.owned-packs {
  &__loader {
    display: flex;

    margin: auto;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 4px;

    width: 100%;
  }

  &__item {
    display: grid;
    align-items: center;
    gap: 15px;
    grid-template-columns: 62px minmax(0, 1fr);

    width: 100%;
    min-height: 72px;

    padding: 8px 10px;

    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;

    color: var(--primary-color);
    text-align: left;

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    &:focus-visible {
      border-color: var(--border-secondary-color);
      outline: none;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-priamry-color);
        background-color: rgb(255 255 255 / 5%);

        .owned-packs__image img {
          transform: translateY(-3px);
        }
      }
    }
  }

  &__image {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 62px;
    height: 60px;

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
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    min-width: 0;
  }

  &__name {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    text-overflow: ellipsis;
  }

  &__quantity {
    flex-shrink: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
  }

  &__state {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;

    width: 100%;

    padding: 28px 12px;

    text-align: center;
  }

  &__state-title {
    max-width: 240px;

    margin: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4;
  }

  &__state-text {
    max-width: 240px;

    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
  }

  &__state-button {
    width: 100%;
    max-width: 180px;
  }

  @media (max-width: $md3) {
    &__items {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__state {
      justify-content: center;
    }
  }

  @media (max-width: $md6) {
    &__items {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 280px;

  padding: 25px;

  text-align: center;

  &__title {
    margin: 0 0 14px;

    color: var(--primary-color);
  }

  &__text {
    max-width: 420px;

    margin: 0 0 20px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 1.5;
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
    font-size: 13px;
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
