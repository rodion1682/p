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
              <div class="relative w-full text-center lg:w-[406px]">
                <img
                  :src="currentProduct.image_details"
                  alt="pack Image"
                  class="w-full"
                />
              </div>

              <div class="relative w-full flex-1">
                <div class="flex flex-col">
                  <div class="font-primary text-[40px]">
                    {{ currentProduct.name }}
                  </div>
                  <div class="mb-[50px] mt-[46px] flex flex-col md:flex-row">
                    <div class="flex flex-col md:w-[150px]">
                      <div class="text-sm font-medium opacity-60">
                        {{ $t('Card inside') }}
                      </div>
                      <div
                        class="mt-2 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        {{ currentProduct.card_count }} {{ $t('cards') }}
                      </div>
                    </div>
                    <div
                      class="mt-4 flex flex-1 flex-col md:mt-0"
                      v-for="item in currentProduct.rarity_probabilities"
                      :key="item.rarity"
                    >
                      <div class="text-sm font-medium capitalize opacity-60">
                        {{ item.rarity }}
                      </div>
                      <div
                        class="mt-2 border-t-[2px] border-white/20 pt-2 text-sm font-medium md:mt-4 md:pt-4"
                      >
                        {{ item.probability * 100 }}%
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
                    class="relative z-[1] mt-[46px] flex flex-wrap items-center justify-between gap-5"
                  >
                    <div class="flex flex-1 flex-wrap items-center gap-5">
                      <div class="flex min-w-[150px] flex-col">
                        <div
                          v-if="
                            currentProduct.old_price &&
                            parseFloat(currentProduct.old_price) >
                              parseFloat(currentProduct.price)
                          "
                          class="flex flex-col gap-2"
                        >
                          <span class="text-[14px] text-secondary line-through">
                            <PriceFormatter :price="currentProduct.old_price" />
                          </span>
                          <PriceFormatter
                            :price="currentProduct.price"
                            currencyClasses="size-[32px]"
                            textClasses="text-[40px]"
                            class="items-center !gap-4"
                          />
                        </div>
                        <PriceFormatter
                          v-else
                          :price="currentProduct.price"
                          currencyClasses="size-[32px]"
                          textClasses="text-[40px]"
                          class="items-center !gap-4"
                        />
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="text-sm font-medium opacity-60">
                          {{ $t('Quantity') }}:
                        </div>
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
                    <button
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
                            cartStore.isItemInCart(currentProduct.id, 'pack')
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
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
// import ProductCarousel from '@/components/ProductCarousel.vue'
import BackIcon from '@/components/icons/BackIcon.vue'
import DecreaseIcon from '@/components/icons/DecreaseIcon.vue'
import IncreaseIcon from '@/components/icons/IncreaseIcon.vue'

import PriceFormatter from '@/components/PriceFormatter.vue'
import { useProductList } from '@/composables/useProductList'

const { myPacks } = useProductList()
const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()
const isLoading = ref(false)

const loading = ref(true)
const error = ref(null)
const currentProduct = computed(() => productStore.currentProduct)
const carouselItems = ref([])
const quantity = ref(1)

const fetchProductData = async () => {
  try {
    loading.value = true
    const productId = route.params.productId
    if (!productId) throw new Error('Product ID is missing')

    await productStore.fetchPackDetails(productId)
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

async function handleCartAction() {
  if (cartStore.isItemInCart(currentProduct.value.id, 'pack')) {
    try {
      isLoading.value = true
      const { success, error: errorMsg } = await cartStore.removeFromCart(
        currentProduct.value.id,
        'pack',
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
      await cartStore.addToCart(currentProduct.value.id, quantity.value, 'pack')

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
onMounted(fetchProductData)
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
