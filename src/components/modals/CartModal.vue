<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[#191B24CC]"
    @click.self="closeModal"
  >
    <div
      class="relative mx-4 max-h-[95vh] w-full max-w-[625px] overflow-hidden rounded-[12px] bg-[#2E303B] p-4 md:p-[58px_40px_45px]"
    >
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between md:mb-[46px]">
        <div class="flex items-baseline gap-2 md:gap-[20px]">
          <h2
            class="font-secondary text-xl font-bold leading-tight text-[#F5F5F5] md:text-[36px] md:leading-[45px]"
          >
            {{ $t('Cart') }}
          </h2>
          <span class="text-sm text-[#F5F5F5] md:text-[20px]">
            ({{ cartStore.items.length }}
            {{ cartStore.items.length === 1 ? 'item' : 'items' }})
          </span>
        </div>
        <button
          @click="closeModal"
          class="absolute right-4 top-4 text-white transition-colors hover:text-white/80 md:right-[34px] md:top-[34px]"
          aria-label="Close cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="1" y1="1" x2="14" y2="14"></line>
            <line x1="14" y1="1" x2="1" y2="14"></line>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="cartStore.isLoading"
        class="flex h-[300px] items-center justify-center"
      >
        <div
          class="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FAA720]"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="cartStore.error && cartStore.error !== 'Cart is empty'"
        class="p-4 md:p-6"
      >
        <div class="mb-4 rounded-xl border border-[#CB3F08] bg-[#2E303B] p-4">
          <p class="text-center text-[#CB3F08]">{{ cartStore.error }}</p>
        </div>
        <BaseButton @click="refreshCart"> {{ $t('Try again') }} </BaseButton>
      </div>

      <!-- Empty Cart State -->
      <div v-else-if="cartStore.isEmpty" class="p-4 text-center md:p-6">
        <p class="mb-4 font-secondary text-lg text-[#F5F5F5] md:text-[20px]">
          Your cart is empty
        </p>
        <BaseButton>
          <RouterLink :to="{ name: 'ProductListPage' }" @click="closeModal">
            {{ $t('Continue shopping') }}
          </RouterLink>
        </BaseButton>
      </div>

      <!-- Cart Content -->
      <template v-else>
        <!-- Steam Trade Link Input -->
        <div class="mb-6 w-full md:mb-[46px]">
          <div class="relative w-full">
            <BaseInput
              type="text"
              placeholder="Steam trade link"
              v-model="tradeUrl"
            />
          </div>
        </div>

        <!-- Cart items -->
        <div
          class="cart-content mb-6 max-h-[260px] overflow-y-auto md:mb-[30px]"
        >
          <div
            v-if="cartStore.items.length === 0"
            class="flex h-20 items-center justify-center"
          >
            <p class="text-[#F5F5F5]/70">Loading items...</p>
          </div>

          <div
            v-else
            v-for="item in cartStore.items"
            :key="item.item_id"
            class="mb-3 last:mb-0 md:mb-[12px]"
          >
            <div
              class="flex items-center rounded-lg border border-[#F5F5F5] bg-transparent p-3 shadow-[3px_3px_7px_rgba(0,0,0,0.5)] md:rounded-[20px] md:p-[20px_30px]"
              :class="{ 'opacity-50': cartStore.isItemLoading(item.item_id) }"
            >
              <div
                class="mr-3 h-12 w-16 flex-shrink-0 md:mr-[40px] md:h-[72px] md:w-[96px]"
              >
                <img
                  :src="getImageUrl(item.item.img_url)"
                  :alt="item.item.title"
                  class="h-full w-full object-contain"
                />
              </div>
              <div class="flex flex-grow flex-col gap-2 md:gap-[16px]">
                <span
                  class="text-xs text-[#F5F5F5] opacity-60 md:text-[16px]"
                  >{{ item.item?.type || 'Item' }}</span
                >
                <span
                  :title="item.item.title"
                  class="line-clamp-1 max-w-[120px] text-sm font-medium text-[#F5F5F5] md:max-w-[200px] md:text-[20px]"
                >
                  {{ item.item.title }}
                </span>

                <!-- Item-specific error message -->
                <span
                  v-if="cartStore.getItemError(item.item_id)"
                  class="mt-1 text-xs text-[#CB3F08] md:text-[14px]"
                >
                  {{ cartStore.getItemError(item.item_id) }}
                </span>
              </div>
              <div class="ml-auto flex flex-col items-end">
                <div class="flex items-center gap-1 md:gap-[10px]">
                  <img
                    :src="settingsStore.settings?.internal_currency?.image"
                    alt="Plus"
                    class="h-4 w-4 md:h-[24px] md:w-[24px]"
                  />
                  <span class="text-sm font-bold text-[#F5F5F5] md:text-[20px]">
                    {{ formatNumber(item.item.price) }}
                  </span>
                </div>
              </div>
              <button
                class="group ml-2 text-white md:ml-[20px]"
                @click="removeItem(item)"
                aria-label="Remove item"
              >
                <svg
                  class="group-hover:text-accent"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_57_4847)">
                    <path
                      d="M4 7H20"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 11V17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14 11V17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_57_4847">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Warning message -->
        <div
          v-if="!hasEnoughFunds"
          class="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-gradient-to-b from-[#381E2E] to-[#764663] p-4 shadow-[3px_3px_7px_rgba(0,0,0,0.5)] md:mb-[40px] md:flex-row md:gap-[16px] md:rounded-[20px] md:p-[30px]"
        >
          <div
            class="flex w-full flex-col items-center md:w-auto md:items-start"
          >
            <p
              class="mb-2 text-center text-sm font-medium leading-tight text-[#F5F5F5] md:mb-[12px] md:text-[16px] md:leading-[19px]"
            >
              Not enough funds!
            </p>
            <div class="flex items-center gap-2 md:gap-[10px]">
              <span
                class="text-xs leading-tight text-[#F5F5F5] md:text-[16px] md:leading-[19px]"
              >
                Your balance:
              </span>
              <div class="flex items-center gap-1 md:gap-[4px]">
                <img
                  :src="settingsStore.settings?.internal_currency?.image"
                  alt="Plus"
                  class="h-4 w-4 md:h-[24px] md:w-[24px]"
                />
                <span class="text-sm font-bold text-[#F5F5F5] md:text-[20px]">
                  {{ formatNumber(userStore.userBalance) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex w-full justify-center md:w-auto">
            <RouterLink
              :to="{
                name: 'account',
              }"
              @click="closeModal"
            >
              <BaseButton variant="green2" class="p-[11px_36px]">
                TOP UP
              </BaseButton>
            </RouterLink>
          </div>
        </div>

        <!-- Total and payment -->
        <div
          class="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-[16px]"
        >
          <div class="flex w-full items-center gap-2 md:w-auto md:gap-[10px]">
            <span
              class="font-secondary text-lg font-bold text-[#F5F5F5] md:text-[24px]"
              >Total:</span
            >
            <div class="flex items-center gap-1 md:gap-[5px]">
              <img
                :src="settingsStore.settings?.internal_currency?.image"
                alt="Plus"
                class="h-4 w-4 md:h-[24px] md:w-[24px]"
              />
              <span class="text-lg font-bold text-[#F5F5F5] md:text-[24px]">
                {{ formatNumber(selectedTotal) }}
              </span>
            </div>
          </div>

          <BaseButton
            :disabled="isPaymentDisabled"
            class="w-full p-2 md:w-auto md:p-[11px_72px]"
            @click="processPayment"
          >
            <span v-if="isProcessingPayment">
              <svg
                class="mr-2 inline-block h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ $t('Processing...') }}
            </span>
            <span v-else>PAY NOW</span>
          </BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { usePurchaseStore } from '@/stores/purchase'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import { useStaticPages } from '@/composables/useStaticPages'
import { useSettingsStore } from '@/stores/settings'
const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const cartStore = useCartStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const purchaseStore = usePurchaseStore()
const emit = defineEmits(['close', 'checkout-success'])
const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

// State
const isProcessingPayment = ref(false)
const tradeUrl = ref('')

// Initialize trade URL from user store if available
onMounted(() => {})

const getImageUrl = url => {
  return `${VITE_STATIC_DOMAIN}/${url}`
}

const selectedTotal = computed(() => {
  // Always use all cart items for the total
  return cartStore.items.reduce((total, item) => {
    return total + parseFloat(item.item.price) * item.count
  }, 0)
})

const isPaymentDisabled = computed(() => {
  return (
    cartStore.isLoading ||
    isProcessingPayment.value ||
    selectedTotal.value === 0 ||
    !hasEnoughFunds.value ||
    cartStore.isEmpty ||
    !tradeUrl.value
  )
})

const hasEnoughFunds = computed(() => {
  return selectedTotal.value <= userStore.userBalance
})

async function refreshCart() {
  try {
    await cartStore.fetchCartContent()
  } catch {
    console.error('Failed to refresh cart')
    toast.error('Failed to refresh cart')
  }
}

async function removeItem(item) {
  try {
    const { success, error } = await cartStore.removeFromCart(
      item.item_id,
      item.is_variation,
    )

    if (success) {
      toast.success('Item removed from cart')
    } else {
      toast.error(error || 'Failed to remove item')
    }
  } catch (err) {
    toast.error('Failed to remove item')
    console.error('Error removing item:', err)
  }
}

function closeModal() {
  emit('close')
}

const router = useRouter()
async function processPayment() {
  if (!tradeUrl.value) {
    toast.error('Please provide a Steam trade link')
    return
  }

  try {
    isProcessingPayment.value = true
    await purchaseStore.purchaseCartItems(tradeUrl.value)
    toast.success('Payment successful!')
    emit('checkout-success')
    closeModal()
    router.push({ name: 'account', query: { tab: 'orders' } })
  } catch (err) {
    toast.error(
      err?.response?.data?.message || 'Payment failed. Please try again.',
    )
    console.error('Payment error:', err)
  } finally {
    isProcessingPayment.value = false
  }
}

function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00'
  }
  return Number(value).toFixed(2)
}

// Initialize cart on component mount
onMounted(async () => {
  try {
    await cartStore.fetchCartContent()
    await ensurePages()
  } catch {
    console.error('Failed to load cart')
    toast.error('Failed to load cart')
  }
})

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    closeModal()
  },
)
</script>

<style scoped>
.cart-content {
  scrollbar-width: thin;
  scrollbar-color: #faa720 #2e303b;
}

.cart-content::-webkit-scrollbar {
  width: 6px;
}

.cart-content::-webkit-scrollbar-track {
  background: #2e303b;
  border-radius: 3px;
}

.cart-content::-webkit-scrollbar-thumb {
  background: #faa720;
  border-radius: 3px;
}

.cart-content::-webkit-scrollbar-thumb:hover {
  background: #faa720;
}
</style>
