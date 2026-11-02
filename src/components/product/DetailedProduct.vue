<template>
  <div class="detailed">
    <LoadingSpinner v-if="loading" class="detailed__loading" />
    <div
      v-else-if="storeError || localError"
      class="detailed__error _text-error"
    >
      {{ storeError || localError }}
    </div>
    <template v-else-if="product">
      <div class="detailed__top">
        <BaseButton
          variant="bordered"
          class="detailed__back"
          @click="goBackToList"
        >
          <SvgIcon class="detailed__back-icon" :icon="ArrowIcon" />
        </BaseButton>
        <div class="detailed__title _h3">{{ product.title }}</div>
      </div>
      <div
        class="detailed__content"
        :style="{ '--quality-color': qualityColor }"
      >
        <div class="detailed__image-wrapper">
          <div v-if="product.img_url" class="detailed__image _ibg-contain">
            <img :src="imgSrc" />
          </div>
        </div>
        <div class="detailed__info">
          <div class="detailed__list">
            <div class="detailed__item" v-if="product.type">
              <div class="detailed__label">{{ $t('Type') }}</div>
              <div class="detailed__value">{{ product.type }}</div>
            </div>
            <div class="detailed__item" v-if="product.quality">
              <div class="detailed__label">{{ $t('Rarity') }}</div>
              <div class="detailed__value detailed__value_quality">
                {{ product.quality }}
              </div>
            </div>
            <div class="detailed__item" v-if="product.exterior">
              <div class="detailed__label">{{ $t('Exterior') }}</div>
              <div class="detailed__value">{{ product.exterior }}</div>
            </div>
          </div>
          <div class="detailed__bottom">
            <div class="detailed__row">
              <div class="detailed__label">{{ $t('Price') }}</div>
              <div class="detailed__prices">
                <PriceFormatter class="detailed__coin" :price="price" />
                <PriceFormatter
                  class="detailed__fiat"
                  :price="price"
                  isCurrency
                />
              </div>
            </div>
            <div v-if="product.old_price" class="detailed__row">
              <div class="detailed__label">{{ $t('Old Price') }}</div>
              <div class="detailed__prices">
                <PriceFormatter
                  isOld
                  class="detailed__coin"
                  :price="getOldFiatPrice"
                />
                <PriceFormatter
                  isOld
                  class="detailed__fiat"
                  :price="oldPrice"
                  isCurrency
                />
              </div>
            </div>

            <!-- Add/Remove cart icon button -->
            <BaseButton
              class="detailed__buy"
              :variant="isInCart ? 'error' : 'bordered'"
              :disabled="isLoading"
              @click="toggleCart"
            >
              <template v-if="isLoading">...</template>
              <template v-else>
                {{ isInCart ? $t('Remvoe from cart') : $t('Buy Now') }}
              </template>
            </BaseButton>

            <!-- Buy button -->
            <!--<BaseButton
              class="detailed__buy"
              :variant="isInCart ? 'bordered' : 'secondary'"
              :disabled="isLoading"
              @click="buyNow"
            >
              {{ isInCart ? $t('Go to cart') : $t('Buy now') }}
            </BaseButton>-->
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'

import { useCurrencyStore } from '@/stores/currency'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ArrowIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'
import LoadingSpinner from '../LoadingSpinner.vue'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const props = defineProps({
  productId: { type: [String, Number], required: true },
  initialProduct: { type: Object, default: null },
  game: { type: String, default: '' },
})

const qualityColorMap = {
  'Consumer Grade': '#B0C3D9',
  'Mil-Spec Grade': '#4B69FF',
  'Industrial Grade': '#5E98D9',
  Restricted: '#8847FF',
  'High Grade': '#4B69FF',
  Classified: '#D32CE6',
  Covert: '#EB4B4B',
  'Base Grade': '#B0C3D9',
  Remarkable: '#8847FF',
  Extraordinary: '#EB4B4B',
  Superior: '#D32CE6',
  Distinguished: '#4B69FF',
  Exotic: '#D32CE6',
  Exceptional: '#8847FF',
  Master: '#EB4B4B',
  Contraband: '#E4AE39',
}

const qualityColor = computed(() => {
  return qualityColorMap[product.value?.quality] || '#8E96AD'
})

const emit = defineEmits(['close', 'loaded'])

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const currencyStore = useCurrencyStore()

const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToast()

const loading = ref(false)
const localError = ref('')
const isLoading = ref(false)

const { currentCurrency } = storeToRefs(currencyStore)

const selectedCurrencyValue = computed(() => {
  return Number(currentCurrency.value?.value) || 1
})

const product = computed(
  () => props.initialProduct || productStore.currentProduct,
)
const storeError = computed(() => productStore.error)

const imgSrc = computed(() => {
  if (product.value?.img_url_big) {
    return product.value?.img_url_big
      ? VITE_STATIC_DOMAIN + product.value.img_url_big
      : ''
  } else {
    return product.value?.img_url
      ? VITE_STATIC_DOMAIN + product.value.img_url
      : ''
  }
})

const price = computed(() => Number(product.value?.price ?? 0).toFixed(2))

const oldPrice = computed(() => {
  return parseFloat(product.value?.old_price * selectedCurrencyValue.value)
})

const getOldFiatPrice = computed(() => {
  return parseFloat(product.value?.old_price * currentCurrency?.value?.value)
})

const stripProductFromPath = path => path.replace(/\/p\/[^/]+$/, '')

const goBackToList = async () => {
  emit('close')

  await router.push({
    path: stripProductFromPath(route.path),
    query: route.query,
  })
}

const isInCart = computed(() =>
  product.value?.id ? cartStore.isItemInCart(product.value.id) : false,
)

async function load(id) {
  localError.value = ''
  loading.value = true
  try {
    if (
      props.initialProduct &&
      String(props.initialProduct.id) === String(id)
    ) {
      emit('loaded', props.initialProduct)
      return
    }

    await productStore.fetchProductDetails(id)

    if (productStore.currentProduct) {
      console.log('productStore.currentProduct', productStore.currentProduct)
      emit('loaded', productStore.currentProduct)
    }
  } catch (e) {
    localError.value = e?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.productId,
  id => {
    if (!id) return
    load(id)
  },
  { immediate: true },
)

async function toggleCart() {
  if (!product.value?.id) return

  if (isInCart.value) {
    try {
      isLoading.value = true
      const { success, error: errorMsg } = await cartStore.removeFromCart(
        product.value.id,
      )

      if (success) toast.success(t('Item removed from cart'))
      else toast.error(errorMsg || t('Failed to remove item'))
    } catch (err) {
      toast.error(err?.message || t('Failed to remove item'))
    } finally {
      isLoading.value = false
    }
    return
  }

  try {
    isLoading.value = true
    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(product.value.id)

    if (success) {
      toast.success(t('Item added to cart'))
    } else {
      if (isUnauthorized) {
        toast.warning(t('Please login to add items to cart'))
        router.push({
          name: 'LoginPage',
          query: { redirect: router.currentRoute.value.fullPath || '/' },
        })
      } else if (isAlreadyInCart) {
        toast.warning(message)
      } else {
        toast.error(message)
      }
    }
  } catch (err) {
    toast.error(err?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

async function buyNow() {
  if (!product.value?.id) return

  // if already in cart -> just go
  if (isInCart.value) {
    router.push({ name: 'CartPage' })
    return
  }

  // otherwise add then go
  try {
    isLoading.value = true
    const { success, isUnauthorized, message } = await cartStore.addToCart(
      product.value.id,
    )

    if (success) {
      router.push({ name: 'CartPage' })
      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to buy items'))
      router.push({
        name: 'LoginPage',
        query: { redirect: router.currentRoute.value.fullPath || '/' },
      })
    } else {
      toast.error(message || t('Failed to add item to cart'))
    }
  } catch (err) {
    toast.error(err?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (!route.path.includes(`/p/`)) {
    productStore.clearCurrentProduct()
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.detailed {
  &:not(:last-child) {
    @include adaptiveValue('margin-bottom', 144, 35);
  }
  &__loading {
  }

  &__error {
  }

  &__top {
    display: flex;
    @include adaptiveValue('gap', 30, 20);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 54, 20);
    }
  }

  &__back {
    border-radius: 50%;
    min-width: 40px;
    max-width: 40px;
    height: 40px;
    &-icon {
      min-width: 19px;
      height: 19px;
      transform: rotate(-180deg);
    }
  }

  &__title {
    align-self: center;
    font-weight: 800;
    text-transform: uppercase;
    @include adaptiveValue('font-size', 24, 16);
  }

  &__content {
    @include adaptiveValue('border-radius', 12, 10);
    @include adaptiveValue('padding-left', 26, 10);
    @include adaptiveValue('gap', 24, 20);
    overflow: hidden;
    padding-right: 0px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -2;
      background: radial-gradient(
        ellipse 20% 100% at 10% 50%,
        var(--quality-color) 0%,
        #131313 100%
      );
      pointer-events: none;
    }
    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      right: 1px;
      bottom: 1px;
      z-index: -1;
      border-radius: inherit;
      background: radial-gradient(circle at top, #323232 0%, #191919 100%);
      pointer-events: none;
    }
    @media (min-width: $md5) {
      display: flex;
    }
    @media (max-width: $md3) {
      padding-left: 10px;
      margin-left: -10px;
      margin-right: -10px;
      gap: 0px;
      &::before {
        background: radial-gradient(
          ellipse 100% 20% at 30% 0%,
          var(--quality-color) 0,
          #131313 100%
        );
      }
    }
    @media (max-width: $md5) {
      padding-left: 0px;
    }
  }

  &__image-wrapper {
    @include adaptiveValue('margin-bottom', 26, 15);
    flex: 0 1 55%;
    @include adaptiveValue('border-radius', 12, 10);
    height: fit-content;
    @include adaptiveValue('padding-top', 88, 15);
    @include adaptiveValue('padding-bottom', 88, 15);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    &::after {
      content: '';
      position: absolute;
      inset: 1px;
      z-index: 1;
      border-radius: inherit;

      background: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.08) 100%
      );
      pointer-events: none;
    }
    @media (min-width: $md5) {
      @include adaptiveValue('margin-top', 26, 15);
    }
    @media (max-width: $md3) {
      flex: 0 1 45%;
    }
  }

  &__image {
    width: 47%;
    padding-bottom: 34.4%;
  }

  &__info {
    display: flex;
    flex-direction: column;
    flex: 0 1 45%;
    border-left: 1px solid #323232;
    @include adaptiveValue('padding-bottom', 43, 15);
    @include adaptiveValue('padding-top', 8, 5);
    @media (max-width: $md3) {
      flex: 0 1 55%;
    }
  }

  &__list {
    flex: 1 1 100%;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: center;
    border-bottom: 1px solid #323232;
    @include adaptiveValue('padding-bottom', 17, 15);
    @include adaptiveValue('padding-top', 17, 15);
    @include adaptiveValue('padding-right', 43, 10);
    @include adaptiveValue('padding-left', 43, 10);
    @media (max-width: $md3) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  &__label {
    font-family: var(--font-sans);
    font-weight: 700;
    color: var(--secondary-color);
  }

  &__value {
    text-transform: uppercase;
    font-weight: 600;
    @include adaptiveValue('font-size', 20, 14);
    @include adaptiveValue('line-height', 27, 21);
    &_quality {
      color: var(--quality-color);
    }
  }

  &__bottom {
    @include adaptiveValue('padding-top', 17, 15);
    @include adaptiveValue('padding-left', 43, 10);
    @include adaptiveValue('padding-right', 43, 10);
    @media (max-width: $md3) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__prices {
  }

  &__coin {
    :deep(.price__currency),
    :deep(.price__value) {
      @include adaptiveValue('font-size', 24, 16);
      @include adaptiveValue('line-height', 33, 25);
      font-weight: 700;
      font-family: var(--font-sans);
      color: var(--primary-color);
    }
    :deep(.price__icon) {
      @include adaptiveValue('min-width', 24, 16);
      @include adaptiveValue('min-height', 24, 16);
    }
  }

  &__fiat {
    justify-self: flex-end;

    :deep(.price__currency),
    :deep(.price__value) {
      font-weight: 400 !important;
      color: var(--secondary-color) !important;
    }
  }

  &__buy {
  }
}
</style>
