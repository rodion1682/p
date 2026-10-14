<template>
  <div class="relative min-h-screen py-14 pb-[145px] pt-[124px]">
    <div class="px-4">
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
        <div v-if="loading" class="flex h-96 items-center justify-center">
          <!-- <LoadingSpinner /> -->
        </div>
        <div
          v-else-if="error"
          class="flex h-96 items-center justify-center text-error"
        >
          <p>{{ error }}</p>
        </div>

        <div v-else>
          <div class="">
            <div class="mb-8 lg:mb-[36px]">
              <div class="flex items-center gap-[36px]">
                <button
                  @click="router.back()"
                  class="group relative h-[68px] w-[76px] transition duration-300 hover:text-accent"
                >
                  <div
                    class="absolute left-0 top-0 h-full w-full bg-black opacity-[69%] blur-[12px]"
                  ></div>
                  <img
                    src="@/assets/images/magiculus/backBg.webp"
                    alt="backBg"
                    class="pointer-events-none absolute right-0 top-0 h-full w-full select-none object-contain object-center"
                  />
                  <span
                    class="absolute left-[calc(50%+4px)] top-[calc(50%-1px)] -translate-x-1/2 -translate-y-1/2 opacity-[56%] transition duration-300 group-hover:opacity-100"
                  >
                    <BackIcon />
                  </span>
                </button>

                <div class="text-[16px] font-medium opacity-40">
                  {{ $t('Back') }}
                </div>
              </div>
            </div>
            <div
              class="relative flex min-h-[602px] flex-col items-center justify-between gap-8 rounded-[16px] bg-[#1A1A1AB8] py-10 pl-[18px] pr-[18px] lg:flex-row lg:gap-4 xl:pr-[86px]"
            >
              <img
                src="@/assets/images/magiculus/heroModalBorder.webp"
                alt="border"
                class="pointer-events-none absolute right-0 top-0 h-full w-full select-none object-cover lg:object-fill"
              />
              <img
                src="@/assets/images/magiculus/gem.webp"
                alt="gem"
                class="pointer-events-none absolute left-1/2 top-[-9px] w-5 -translate-x-1/2 select-none object-contain"
              />
              <div class="relative h-[540px] w-full text-center lg:w-[406px]">
                <div
                  class="absolute left-1/2 top-1/2 mx-auto block h-[290px] w-[180px] -translate-x-1/2 -translate-y-1/2 scale-[1.9] transition duration-300"
                >
                  <img
                    :src="currentProduct.image_2"
                    alt="cardBg Image"
                    class="absolute left-1/2 top-1/2 w-[210px] max-w-[unset] -translate-x-1/2 -translate-y-1/2 object-contain transition-opacity duration-300"
                  />
                  <img
                    :src="currentProduct.image"
                    alt="cardImg Image"
                    class="absolute left-1/2 top-[40px] ml-[1px] w-[120px] max-w-[unset] -translate-x-1/2 object-contain transition-opacity duration-300"
                  />

                  <div
                    class="absolute bottom-[40px] left-1/2 flex h-[70px] w-[100px] -translate-x-1/2 flex-col items-center justify-center text-[8px] leading-[120%] text-[#411E00]"
                  >
                    <span v-html="currentProduct.description" />
                  </div>
                  <div
                    v-if="
                      currentProduct.mana_cost ||
                      currentProduct.mana_cost == '0'
                    "
                    class="absolute left-[14px] top-[24px] z-[2] flex h-[32px] w-[32px] items-center justify-center font-tertiary text-[24px] text-[#fff] [-webkit-text-stroke:2px_#01588A]"
                  >
                    {{ currentProduct.mana_cost }}
                  </div>
                  <div
                    v-if="currentProduct.attack || currentProduct.attack == '0'"
                    class="absolute bottom-[21px] left-[14px] z-[2] flex h-[32px] w-[32px] items-center justify-center font-tertiary text-[24px] text-[#fff] [-webkit-text-stroke:2px_#066508]"
                  >
                    {{ currentProduct.attack }}
                  </div>
                  <div
                    v-if="currentProduct.health || currentProduct.health == '0'"
                    class="absolute bottom-[21px] right-[14px] z-[2] flex h-[32px] w-[32px] items-center justify-center font-tertiary text-[24px] text-[#fff] [-webkit-text-stroke:2px_#7A0102]"
                  >
                    {{ currentProduct.health }}
                  </div>

                  <div
                    v-if="currentProduct.type == 'spell'"
                    class="absolute bottom-[108px] left-1/2 -translate-x-1/2"
                  >
                    <svg viewBox="0 0 500 200" class="h-auto w-full">
                      <path
                        id="curvePath2"
                        fill="transparent"
                        d="M50,90 Q250,160 450,140"
                      />
                      <text class="fill-current text-[46px]">
                        <textPath
                          href="#curvePath2"
                          startOffset="50%"
                          text-anchor="middle"
                        >
                          {{ currentProduct.name }}
                        </textPath>
                      </text>
                    </svg>
                  </div>
                  <div
                    v-else
                    class="absolute bottom-[112px] left-1/2 -translate-x-1/2"
                  >
                    <svg viewBox="0 0 500 200" class="h-auto w-full">
                      <path
                        id="curvePath"
                        fill="transparent"
                        d="M50,150 Q250,100 450,150"
                      />
                      <text class="fill-current text-[46px]">
                        <textPath
                          href="#curvePath"
                          startOffset="50%"
                          text-anchor="middle"
                        >
                          {{ currentProduct.name }}
                        </textPath>
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="relative w-full flex-1">
                <div class="flex flex-col">
                  <div class="font-primary text-[40px]">
                    {{ currentProduct.name }}
                  </div>
                  <div class="mb-[50px] mt-[46px] flex flex-col md:flex-row">
                    <div class="flex flex-col md:w-[150px]">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Hero') }}
                      </div>
                      <div
                        class="mt-2 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        {{ currentProduct.hero.name }}
                      </div>
                    </div>
                    <div class="mt-4 flex flex-1 flex-col md:mt-0">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Type') }}
                      </div>
                      <div
                        class="mt-2 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        {{ currentProduct.type }}
                      </div>
                    </div>
                    <div class="mt-4 flex flex-1 flex-col md:mt-0">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Rarity') }}
                      </div>
                      <div
                        class="mt-2 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        {{ currentProduct.rarity }}
                      </div>
                    </div>
                    <div class="mt-4 flex flex-1 flex-col md:mt-0">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Mana') }}
                      </div>
                      <div
                        class="mt-2 flex items-center gap-3 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        <ManaIcon />
                        <span>
                          {{
                            currentProduct.mana_cost ||
                            currentProduct.mana_cost == '0'
                              ? currentProduct.mana_cost
                              : '-'
                          }}</span
                        >
                      </div>
                    </div>
                    <div class="mt-4 flex flex-1 flex-col md:mt-0">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Attack') }}
                      </div>
                      <div
                        class="mt-2 flex items-center gap-3 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        <AttackIcon />
                        <span>
                          {{
                            currentProduct.attack ||
                            currentProduct.attack == '0'
                              ? currentProduct.attack
                              : '-'
                          }}</span
                        >
                      </div>
                    </div>
                    <div class="mt-4 flex flex-col md:mt-0">
                      <div class="text-sm font-medium opacity-60">
                        <span>{{ $t('Health') }}</span>
                      </div>
                      <div
                        class="mt-2 flex items-center gap-3 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        <HeartIcon />
                        <span>
                          {{
                            currentProduct.health ||
                            currentProduct.health == '0'
                              ? currentProduct.health
                              : '-'
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col md:flex-row">
                    <div class="w-full md:w-[150px]">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Description') }}:
                      </div>
                    </div>
                    <div
                      class="mt-3 flex-1 whitespace-pre-line text-sm font-medium md:mt-0"
                      v-html="currentProduct.description"
                    ></div>
                  </div>
                  <div
                    class="mt-[46px] flex gap-5"
                    v-if="
                      myProducts &&
                      settingsStore.settings?.payouts?.offer_enabled &&
                      myProducts.find(item => item.card.id == currentProduct.id)
                    "
                  >
                    <div class="group">
                      <label
                        class="relative flex cursor-pointer items-center gap-3"
                      >
                        <div
                          class="h-6 w-6 rounded-[6px] border border-[#EEC98E3B] bg-[#30302F] shadow-[inset_0px_4px_4px_0px_#00000040]"
                        >
                          <CheckIconInactive
                            v-if="pageType == 'sell'"
                            class="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 transition duration-300 group-hover:opacity-100"
                          />
                          <transition name="fade">
                            <CheckIconActive
                              v-if="pageType == 'buy'"
                              class="absolute left-0 top-1/2 -translate-y-1/2"
                            />
                          </transition>
                        </div>

                        <input
                          name="pageType"
                          value="buy"
                          type="radio"
                          v-model="pageType"
                          class="hidden"
                        />

                        <span class="text-base capitalize">
                          {{ $t('Buy') }}
                        </span>
                      </label>
                    </div>
                    <div class="group">
                      <label
                        class="relative flex cursor-pointer items-center gap-3"
                      >
                        <div
                          class="h-6 w-6 rounded-[6px] border border-[#EEC98E3B] bg-[#30302F] shadow-[inset_0px_4px_4px_0px_#00000040]"
                        >
                          <CheckIconInactive
                            v-if="pageType == 'buy'"
                            class="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 transition duration-300 group-hover:opacity-100"
                          />
                          <transition name="fade">
                            <CheckIconActive
                              v-if="pageType == 'sell'"
                              class="absolute left-0 top-1/2 -translate-y-1/2"
                            />
                          </transition>
                        </div>

                        <input
                          name="pageType"
                          value="sell"
                          type="radio"
                          v-model="pageType"
                          class="hidden"
                        />

                        <span class="text-base capitalize">
                          {{ $t('Sell') }}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div
                    class="relative z-[1] mt-[46px] flex flex-wrap items-center justify-between gap-5"
                    :class="{
                      'mt-0':
                        myProducts &&
                        settingsStore.settings?.payouts?.offer_enabled &&
                        myProducts.find(
                          item => item.card.id == currentProduct.id,
                        ),
                    }"
                  >
                    <div
                      class="flex max-w-[406px] flex-1 flex-wrap items-center justify-between gap-5"
                    >
                      <div class="flex flex-col gap-4">
                        <div class="text-sm font-medium opacity-60">
                          {{ $t('Price') }}:
                        </div>
                        <div class="flex min-w-[150px] flex-col">
                          <div
                            v-if="
                              currentProduct.old_price &&
                              parseFloat(currentProduct.old_price) >
                                parseFloat(displayPrice)
                            "
                            class="flex flex-col gap-2"
                          >
                            <span
                              class="text-[14px] text-secondary line-through"
                            >
                              <PriceFormatter
                                :price="currentProduct.old_price"
                              />
                            </span>
                            <div v-if="pageType == 'buy'">
                              <PriceFormatter
                                :price="displayPrice"
                                currencyClasses="size-[32px]"
                                textClasses="text-[40px]"
                                class="items-center !gap-4"
                              />
                            </div>
                            <div v-if="pageType == 'sell'">
                              <PriceFormatter
                                :price="currentProduct.sale_price"
                                currencyClasses="size-[32px]"
                                textClasses="text-[40px]"
                                class="items-center !gap-4"
                              />
                            </div>
                          </div>
                          <div v-else>
                            <div v-if="pageType == 'buy'">
                              <PriceFormatter
                                :price="displayPrice"
                                currencyClasses="size-[32px]"
                                textClasses="text-[40px]"
                                class="items-center !gap-4"
                              />
                            </div>
                            <div v-if="pageType == 'sell'">
                              <PriceFormatter
                                :price="currentProduct.sale_price"
                                currencyClasses="size-[32px]"
                                textClasses="text-[40px]"
                                class="items-center !gap-4"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-col gap-4" v-if="!route.query.rent">
                        <div class="text-sm font-medium opacity-60">
                          {{ $t('Quantity') }}:
                        </div>
                        <div class="flex items-center gap-4">
                          <BaseInput
                            v-model="quantity"
                            class="!w-[55px]"
                            inputClasses="text-center  p-0"
                          />
                          <div class="flex items-center gap-[9px]">
                            <button
                              :disabled="quantity == 1"
                              @click="decreaseQty()"
                              class="opacity-[56%]"
                              :class="[
                                { '!opacity-20': quantity == 1 },
                                {
                                  'hover:text-accent hover:opacity-100':
                                    quantity != 1,
                                },
                              ]"
                            >
                              <DecreaseIcon />
                            </button>
                            <button
                              @click="increaseQty()"
                              class="opacity-[56%] hover:text-accent hover:opacity-100"
                            >
                              <IncreaseIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-col gap-4" v-if="route.query.rent">
                        <div class="text-sm font-medium opacity-60">
                          {{ $t('Rent Period') }}:
                        </div>

                        <div class="relative">
                          <select
                            class="h-[46px] w-full appearance-none rounded-[8px] border border-[#EEC98E3B] bg-[#30302F] px-4 pr-10 text-[16px] leading-[20px] text-primary shadow-[inset_0_4px_4px_0_rgba(0,0,0,0.25)]"
                            v-model="rentalPeriodId"
                          >
                            <option
                              v-for="item in cartStore?.rentalPeriods"
                              :value="item.id"
                              :key="item.id"
                            >
                              {{ item.label }}
                            </option>
                          </select>
                          <svg
                            class="absolute right-3 top-1/2 -translate-y-1/2"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            :class="[
                              isOpen ? 'rotate-180' : '',
                              'transition-transform',
                            ]"
                          >
                            <path
                              d="M6.84512 9.02666L11.2021 4.66963C11.6709 4.20088 11.6709 3.44385 11.2021 2.9751C10.7334 2.50635 9.97637 2.50635 9.50762 2.9751L5.99902 6.48604L2.49043 2.9751C2.02168 2.50635 1.26465 2.50635 0.795898 2.9751C0.327148 3.44385 0.327148 4.20088 0.795898 4.66963L5.15293 9.02666C5.61934 9.49307 6.37871 9.49307 6.84512 9.02666Z"
                              fill="#fff"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      class="group relative h-[92px] w-[232px]"
                      @click.stop="handleSell"
                      :disabled="isLoading"
                      v-if="
                        !route.query.rent &&
                        pageType == 'sell' &&
                        myProducts &&
                        settingsStore.settings?.payouts?.offer_enabled &&
                        myProducts.find(
                          item => item.card.id == currentProduct.id,
                        )
                      "
                    >
                      <img
                        src="@/assets/images/magiculus/btnBg.webp"
                        alt="btnBg"
                        class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain"
                      />

                      <img
                        src="@/assets/images/magiculus/btnBgLine.webp"
                        alt="btnBgLine"
                        class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain opacity-0 transition duration-300 group-hover:opacity-100"
                      />
                      <span
                        class="relative mx-auto inline-block"
                        v-if="isLoading"
                      >
                        <span class="loading-spinner block w-5" />
                      </span>
                      <span
                        v-else
                        class="font-secondary text-[24px] transition duration-300 group-hover:text-accent"
                      >
                        <span class="mx-auto inline-block">
                          {{ $t('SELL') }}
                        </span>
                      </span>
                    </button>

                    <button
                      v-if="pageType == 'buy'"
                      class="group relative h-[92px] w-[232px]"
                      @click.stop="handleCartAction"
                      :disabled="isLoading"
                    >
                      <img
                        src="@/assets/images/magiculus/btnBg.webp"
                        alt="btnBg"
                        class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain"
                      />

                      <img
                        src="@/assets/images/magiculus/btnBgLine.webp"
                        alt="btnBgLine"
                        class="pointer-events-none absolute left-0 top-0 -z-[1] h-full w-full select-none object-contain opacity-0 transition duration-300 group-hover:opacity-100"
                      />
                      <span
                        class="relative mx-auto inline-block"
                        v-if="isLoading"
                      >
                        <span class="loading-spinner block w-5" />
                      </span>
                      <span
                        v-else
                        class="font-secondary text-[24px] transition duration-300 group-hover:text-accent"
                      >
                        <span
                          v-if="
                            cartStore.isItemInCart(currentProduct.id, 'card')
                          "
                          class="mx-auto inline-block"
                        >
                          {{ $t('REMOVE') }}
                        </span>
                        <span v-else>{{ $t('BUY') }}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="relative mt-[64px]">
      <ProductCarousel
        v-if="carouselItems.length > 0"
        title="Related Cards"
        :products="carouselItems"
      />
    </div> -->
  </div>
</template>

<script setup>
import AttackIcon from '@/components/icons/AttackIcon.vue'
import BackIcon from '@/components/icons/BackIcon.vue'
import CheckIconActive from '@/components/icons/CheckIconActive.vue'
import CheckIconInactive from '@/components/icons/CheckIconInactive.vue'
import DecreaseIcon from '@/components/icons/DecreaseIcon.vue'
import HeartIcon from '@/components/icons/HeartIcon.vue'
import IncreaseIcon from '@/components/icons/IncreaseIcon.vue'
import ManaIcon from '@/components/icons/ManaIcon.vue'
import { useProductList } from '@/composables/useProductList'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useProductStore } from '@/stores/product'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'

const { myProducts } = useProductList()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToast()
const offerFlowStore = useOfferFlowStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

const rentalPeriodId = ref(null)

const rentalPrice = computed(() => {
  const prices = currentProduct.value?.rental_prices
  if (!prices?.length || !rentalPeriodId.value) {
    return null
  }
  const match = prices.find(p => p.rental_period_id === rentalPeriodId.value)
  return match ? parseFloat(match.price).toFixed(2) : null
})

const displayPrice = computed(() => {
  if (route.query.rent && rentalPrice.value !== null) {
    return rentalPrice.value
  }
  return currentProduct.value?.price
})

const loading = ref(true)
const error = ref(null)
const currentProduct = computed(() => productStore.currentProduct)
const carouselItems = ref([])
const quantity = ref(1)
const isLoading = ref(false)
const pageType = ref('buy')

watch(
  () => cartStore.rentalPeriods,
  periods => {
    if (periods?.length && !rentalPeriodId.value) {
      rentalPeriodId.value = periods[0].id
    }
  },
  { immediate: true },
)

const fetchProductData = async () => {
  try {
    loading.value = true
    const productId = route.params.productId
    if (!productId) throw new Error('Product ID is missing')

    await productStore.fetchProductDetails(productId)
  } catch (err) {
    error.value = err.message || 'Unable to load product details'
  } finally {
    loading.value = false
  }
}

const increaseQty = async () => {
  quantity.value = parseInt(quantity.value) + 1
}
const decreaseQty = async () => {
  quantity.value = parseInt(quantity.value) - 1
}

async function handleSell() {
  try {
    isLoading.value = true
    const { success, error: errorMsg } = await offerFlowStore.createOffer({
      id: currentProduct.value.id,
      quantity: quantity.value,
    })
    if (success) {
      toast.success(t('We`ve received your sale offer!'))
      await userStore.fetchProfile()
    } else {
      toast.error(errorMsg || t('Failed to create sale offer'))
    }
  } catch (err) {
    toast.error(err.message || t('Failed to create sale offer'))
  } finally {
    isLoading.value = false
  }
  return
}

async function handleCartActionRent() {
  try {
    isLoading.value = true
    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.rentCard(currentProduct.value.id, rentalPeriodId.value)

    if (success) {
      toast.success(message)
      await userStore.fetchProfile()
    } else {
      if (isUnauthorized) {
        toast.warning(t('Please login to rent a card'))
        router.push({
          name: 'Auth',
          query: {
            form: 'signin',
            redirect: router.currentRoute.value.fullPath || '/',
          },
        })
      } else if (isAlreadyInCart) {
        toast.warning(message)
      } else {
        toast.error(message)
      }
    }
  } catch (err) {
    toast.error(err.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

async function handleCartAction() {
  if (cartStore.isItemInCart(currentProduct.value.id, 'card')) {
    try {
      isLoading.value = true
      const { success, error: errorMsg } = await cartStore.removeFromCart(
        currentProduct.value.id,
        'card',
        rentalPeriodId.value,
      )

      if (success) {
        toast.success(t('Item removed from cart'))
      } else {
        toast.error(errorMsg || t('Failed to remove item'))
      }
    } catch (err) {
      toast.error(err.message || t('Failed to remove item'))
    } finally {
      isLoading.value = false
    }
    return
  }

  try {
    isLoading.value = true
    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(
        currentProduct.value.id,
        quantity.value,
        'card',
        rentalPeriodId.value,
      )

    if (success) {
      toast.success(message)
    } else {
      if (isUnauthorized) {
        toast.warning(t('Please login to add items to cart'))
        router.push({
          name: 'Auth',
          query: {
            form: 'signin',
            redirect: router.currentRoute.value.fullPath || '/',
          },
        })
      } else if (isAlreadyInCart) {
        toast.warning(message)
      } else {
        toast.error(message)
      }
    }
  } catch (err) {
    toast.error(err.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

const addToCart = async (navigate = false) => {
  try {
    const id = currentProduct.value.id
    const { success, message, isUnauthorized } = await cartStore.addToCart(
      id,
      quantity.value,
    )
    if (!success) {
      if (isUnauthorized) {
        toast.warning(t('Please login to add items to cart'))
        router.push({
          name: 'Auth',
          query: {
            form: 'signin',
            redirect: router.currentRoute.value.fullPath || '/',
          },
        })
        return
      }
      toast.error(message || 'Failed to add item to cart')
    } else {
      toast.success('Item added to cart!')
      if (navigate) {
        router.push({ name: 'CartPage' })
      }
    }
  } catch (err) {
    toast.error('Failed to add item to cart')
    console.error('Add to cart error:', err)
  }
}

const fetchProductsByCategory = async category => {
  try {
    const safeCategory = category || 'cs2'
    const params = {
      category: safeCategory,
      random: true,
      limit: 20,
    }
    await productStore.fetchRandomProducts(params)
    carouselItems.value = productStore.randomProducts
  } catch (error) {
    console.error('Error fetching products by category:', error)
    carouselItems.value = []
  }
}

watch(() => route.params.productId, fetchProductData)

onMounted(async () => {
  await fetchProductData()
})
</script>

<style scoped>
.loading-spinner {
  @apply h-[20px] w-[20px] rounded-full border-2 border-b-transparent border-r-transparent border-t-accent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 200% 100%;

  transition: opacity 0.3s ease;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
