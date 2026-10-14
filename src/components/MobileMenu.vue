<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-x-full"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 -translate-x-full"
  >
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="fixed left-0 right-0 top-0 z-50 h-full overflow-auto bg-[#1A1615]"
    >
      <!-- Mobile Menu Header -->
      <div
        class="relative flex items-center justify-between px-[16px] py-[14px]"
      >
        <div
          class="absolute bottom-0 left-0 h-[1px] w-full bg-[linear-gradient(90deg,rgba(142,120,84,0.1674)_0%,rgba(244,206,145,0.27)_47.12%,rgba(142,120,84,0.1674)_100%)]"
        ></div>
        <div
          class="absolute bottom-[2px] left-0 h-[1px] w-full bg-[linear-gradient(90deg,rgba(142,120,84,0.1674)_0%,rgba(244,206,145,0.27)_47.12%,rgba(142,120,84,0.1674)_100%)]"
        ></div>
        <RouterLink
          to="/"
          class="relative flex items-center"
          @click="$emit('close')"
        >
          <img
            src="@/assets/images/magiculus/logo.svg"
            class="relative"
            alt="logo"
          />
        </RouterLink>
        <button
          @click="$emit('close')"
          class="relative flex size-[40px] items-center justify-center text-white"
        >
          <img
            src="@/assets/images/magiculus/settingsBtnBg.webp"
            alt="settingsBtnBg"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <CloseIcon class="relative text-[#fff] transition duration-300" />
        </button>
      </div>

      <!-- Mobile Navigation Links -->
      <div class="flex flex-col p-[16px]">
        <RouterLink
          :to="{ name: 'AboutPage' }"
          class="group relative px-10 font-primary leading-[86px] transition duration-300 hover:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.19)_50%,rgba(0,0,0,0)_100%)] hover:text-primary"
          :class="[
            route.name === 'AboutPage'
              ? 'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.19)_50%,rgba(0,0,0,0)_100%)] !text-accent'
              : 'text-[#FFFFFF99]',
          ]"
        >
          <div
            :class="[route.name === 'AboutPage' ? 'opacity-100' : 'opacity-0']"
            class="absolute left-0 top-0 h-full w-[1px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(244,206,145,0.39)_50%,rgba(0,0,0,0)_100%)] opacity-0 transition duration-300 group-hover:opacity-100"
          ></div>
          <div
            :class="[route.name === 'AboutPage' ? 'opacity-100' : 'opacity-0']"
            class="absolute right-0 top-0 h-full w-[1px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(244,206,145,0.39)_50%,rgba(0,0,0,0)_100%)] opacity-0 transition duration-300 group-hover:opacity-100"
          ></div>
          {{ $t(`About the World`) }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'ProductListPage' }"
          class="group relative px-10 font-primary leading-[86px] transition duration-300 hover:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.19)_50%,rgba(0,0,0,0)_100%)] hover:text-primary"
          :class="[
            route.name === 'ProductListPage'
              ? 'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.19)_50%,rgba(0,0,0,0)_100%)] !text-accent'
              : 'text-[#FFFFFF99]',
          ]"
        >
          <div
            class="absolute left-0 top-0 h-full w-[1px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(244,206,145,0.39)_50%,rgba(0,0,0,0)_100%)] transition duration-300 group-hover:opacity-100"
            :class="[
              route.name === 'ProductListPage' ? 'opacity-100' : 'opacity-0',
            ]"
          ></div>
          <div
            :class="[
              route.name === 'ProductListPage' ? 'opacity-100' : 'opacity-0',
            ]"
            class="absolute right-0 top-0 h-full w-[1px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(244,206,145,0.39)_50%,rgba(0,0,0,0)_100%)] opacity-0 transition duration-300 group-hover:opacity-100"
          ></div>

          {{ $t(`Shop`) }}
        </RouterLink>

        <template v-if="!authStore.isAuthenticated">
          <RouterLink
            :to="{ name: 'Auth', query: { form: 'signin' } }"
            class="group relative px-10 font-primary leading-[86px] text-[#FFFFFF99] transition duration-300 hover:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.19)_50%,rgba(0,0,0,0)_100%)] hover:text-primary"
          >
            <div
              class="absolute left-0 top-0 h-full w-[1px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(244,206,145,0.39)_50%,rgba(0,0,0,0)_100%)] opacity-0 transition duration-300 group-hover:opacity-100"
            ></div>
            <div
              class="absolute right-0 top-0 h-full w-[1px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(244,206,145,0.39)_50%,rgba(0,0,0,0)_100%)] opacity-0 transition duration-300 group-hover:opacity-100"
            ></div>

            {{ $t(`Login`) }}
          </RouterLink>
        </template>

        <div v-else class="flex flex-col gap-6 px-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <PriceFormatter
                currencyClasses="size-[32px] "
                textClasses="text-[24px] "
                class="items-center !gap-4"
                :price="userStore.userBalance"
              />
              <RouterLink
                :to="{ name: 'account-wallet' }"
                @click="topUp()"
                class="opacity-[56%] hover:text-accent hover:opacity-100"
              >
                <IncreaseIcon />
              </RouterLink>
            </div>
          </div>

          <ProfileDropdown
            :email="profile?.email || ''"
            :balance="profile?.balance || 0"
            :currency="authStore.settings?.internal_currency_name"
            :currency-image="authStore.settings?.internal_currency_image"
            :verification-type="
              profile?.verification_data?.status === 'approved'
                ? 'verified'
                : 'unverified'
            "
            @logout="logout"
          />
          <RouterLink
            to="/cart"
            class="group relative flex h-[42px] w-[42px] items-center justify-center"
          >
            <div
              class="absolute left-1/2 top-1/2 mt-1 h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 bg-[#00000091] blur-[12px]"
            ></div>
            <img
              src="@/assets/images/magiculus/settingsBtnBg.webp"
              alt="settingsBtnBg"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <BasketIcon
              class="relative text-[#fff] opacity-[56%] shadow-[0px_4px_4px_0px_#00000040] transition duration-300 group-hover:text-accent group-hover:opacity-100 group-hover:shadow-[unset]"
              :class="{
                'text-accent !opacity-100': route.name === 'CartPage',
              }"
            />
            <div
              v-if="cartstore.cartItemsCount && cartstore.cartItemsCount > 0"
              class="absolute bottom-0 right-0 flex h-[11px] w-[11px] items-center justify-center rounded-full border-2 border-[#1B1B1C] bg-accent text-[10px]"
            >
              {{ cartstore.cartItemsCount }}
            </div>
          </RouterLink>
          <div class="flex items-center gap-5">
            <div class="text-[14px] font-medium opacity-40">
              {{ $t('Back') }}
            </div>
            <button
              @click="
                () => {
                  authStore.logout()
                }
              "
              class="group relative h-[42px] w-[42px] transition duration-300 hover:text-accent"
            >
              <div
                class="absolute left-0 top-1 h-full w-full bg-black opacity-[57%] blur-[12px]"
              ></div>
              <img
                src="@/assets/images/magiculus/settingsBtnBg.webp"
                alt="settingsBtnBg"
                class="pointer-events-none absolute right-0 top-0 h-full w-full select-none object-contain object-center"
              />
              <span
                class="absolute left-1/2 top-[calc(50%-2px)] -translate-x-1/2 -translate-y-1/2 opacity-[56%] transition duration-300 group-hover:opacity-100"
              >
                <OnIcon />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref, onBeforeUnmount } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import CartIcon from '@/components/icons/CartIcon.vue'
import { useStaticStore } from '@/stores/static'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import BasketIcon from '@/components/icons/BasketIcon.vue'
import IncreaseIcon from '@/components/icons/IncreaseIcon.vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
const userStore = useUserStore()
const cartstore = useCartStore()
import OnIcon from '@/components/icons/OnIcon.vue'

const route = useRoute()
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const staticStore = useStaticStore()
const authStore = useAuthStore()
const emit = defineEmits(['close', 'openCart'])
const dropdownRef = ref(null)

const checkWidthAndClose = () => {
  if (window.innerWidth >= 768) {
    emit('close')
  }
}

onMounted(async () => {
  window.addEventListener('resize', checkWidthAndClose)
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      emit('close')
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkWidthAndClose)
  window.removeEventListener('keydown', event => {
    if (event.key === 'Escape') {
      emit('close')
    }
  })
})
</script>

<style scoped></style>
