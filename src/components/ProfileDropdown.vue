<!-- ProfileDropdown.vue -->
<template>
  <div class="relative inline-block" ref="profileDropdownRef">
    <!-- trigger / button ---------------------------------------------------- -->
    <RouterLink
      to="/account/personal"
      class="relative flex h-[70px] w-[70px] cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition duration-300 hover:border-accent"
      :class="{
        '!border-accent': route.name?.toString().includes('account'),
      }"
    >
      <img
        src="@/assets/images/magiculus/ava.webp"
        alt="ava img"
        class="pointer-events-none absolute left-1/2 top-1/2 h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 select-none object-cover object-center"
      />

      <div
        to="/cart"
        class="group absolute right-[-15px] top-1/2 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center"
      >
        <div
          class="absolute left-1/2 top-1/2 mt-1 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 bg-[#00000091] blur-[12px]"
        ></div>
        <img
          src="@/assets/images/magiculus/settingsBtnBg.webp"
          alt="settingsBtnBg"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <ArrowDown
          class="relative text-[#fff] opacity-[56%] shadow-[0px_4px_4px_0px_#00000040] transition duration-300 group-hover:text-accent group-hover:opacity-100 group-hover:shadow-[unset]"
          :class="{
            'text-accent !opacity-100': route.name
              ?.toString()
              .includes('account'),
          }"
        />
      </div>
    </RouterLink>

    <!-- dropdown ----------------------------------------------------------- -->
    <transition name="fade">
      <div
        v-if="isOpen"
        :style="dropdownStyle"
        class="absolute top-[calc(100%+15px)] z-[100] w-[262px] rounded-[20px] bg-white shadow-[0px_4px_12px_rgba(3,0,27,0.1)]"
      >
        <!-- little arrow / triangle -->
        <div
          :style="arrowStyle"
          class="absolute h-[20px] w-[20px] rotate-45 bg-[#03001B]"
        ></div>

        <!-- header section -->
        <div class="relative w-full rounded-t-[20px] bg-[#03001B]">
          <div class="flex items-center p-[23px_12px_23px_18px]">
            <div
              class="mr-[12px] flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06]"
            >
              <!-- white avatar -->
              <svg
                width="42"
                height="42"
                viewBox="0 0 42 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 18.7894C26.1887 18.7894 30.3949 14.5833 30.3949 9.39471C30.3949 4.20616 26.1887 0 21 0C15.8116 0 11.6055 4.20616 11.6055 9.39471C11.6055 14.5833 15.8116 18.7894 21 18.7894Z"
                  fill="white"
                />
                <path
                  d="M21 21C11.8436 21 4.4209 28.4228 4.4209 37.5789C4.4209 40.0206 6.40031 42 8.84197 42H33.1578C35.5994 42 37.5788 40.0206 37.5788 37.5789C37.5788 28.4228 30.1561 21 21 21Z"
                  fill="white"
                />
              </svg>
            </div>
            <div class="flex w-full flex-col">
              <span
                class="font-Roboto mb-1 truncate text-[12px] font-bold leading-[14px] text-white"
              >
                {{ userStore.userEmail }}
              </span>
              <router-link
                :to="{ name: 'account-personal' }"
                class="font-Roboto flex h-[24px] w-[79px] items-center justify-center rounded-[8px] border border-[#5277D1] bg-[rgba(82,119,209,0.2)] text-[12px] font-semibold leading-[20px] text-[#5277D1]"
                @click="isOpen = false"
                >{{ $t('Edit profile') }}</router-link
              >
            </div>
          </div>
        </div>

        <!-- balance ------------------------------------------------------- -->
        <div class="flex items-center justify-between p-[14px_16px]">
          <div
            class="font-Roboto text-[14px] font-bold leading-[16px] text-[#03001B]"
          >
            {{ $t('Balance') }}:
          </div>
          <div class="flex items-center gap-2.5">
            <PriceFormatter :price="userStore.userBalance" />
            <RouterLink
              :to="{ name: 'account-transactions' }"
              class="font-Roboto flex h-[24px] w-[24px] items-center justify-center rounded-[8px] border border-[#5277D1] bg-[rgba(82,119,209,0.2)] text-[12px] font-semibold leading-[20px] text-[#5277D1]"
              @click="toggleDropdown"
              >+</RouterLink
            >
          </div>
        </div>

        <div class="h-px w-full bg-[rgba(3,0,27,0.1)]"></div>

        <!-- menu items ---------------------------------------------------- -->
        <div class="p-[8px_20px]">
          <router-link
            :to="{ name: 'account-personal' }"
            class="flex items-center p-[8px_15px] no-underline"
            @click="isOpen = false"
            ><span
              class="font-Roboto text-[14px] font-bold leading-[16px] text-[#03001B]"
              >{{ $t('My profile') }}</span
            ></router-link
          >

          <router-link
            :to="{ name: 'account-transactions' }"
            class="flex items-center p-[8px_15px] no-underline"
            @click="isOpen = false"
            ><span
              class="font-Roboto text-[14px] font-bold leading-[16px] text-[#03001B]"
              >{{ $t('Payment history') }}</span
            ></router-link
          >

          <router-link
            :to="{ name: 'account-orders' }"
            class="flex items-center p-[8px_15px] no-underline"
            @click="isOpen = false"
            ><span
              class="font-Roboto text-[14px] font-bold leading-[16px] text-[#03001B]"
              >{{ $t('Order history') }}</span
            ></router-link
          >

          <router-link
            v-if="settingsStore.settings?.payouts?.offer_enabled"
            :to="{ name: 'account-offers' }"
            class="flex items-center p-[8px_15px] no-underline"
            @click="isOpen = false"
            ><span
              class="font-Roboto text-[14px] font-bold leading-[16px] text-[#03001B]"
              >{{ $t('Sell skins') }}</span
            ></router-link
          >
        </div>

        <div class="h-px w-full bg-[rgba(3,0,27,0.1)]"></div>

        <!-- logout ------------------------------------------------------- -->
        <div class="p-[8px_20px]">
          <button
            class="flex w-full items-center border-none bg-transparent p-[8px_15px]"
            @click="handleLogout"
          >
            <span
              class="font-Roboto text-[14px] font-bold leading-[16px] text-[#03001B]"
              >{{ $t('Log out') }}</span
            >
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize, onClickOutside } from '@vueuse/core'
import PriceFormatter from './PriceFormatter.vue'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useRoute } from 'vue-router'
import ArrowDown from './icons/ArrowDown.vue'

const route = useRoute()

/* stores / props / emits --------------------------------------------- */
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const emit = defineEmits(['logout'])

/* state --------------------------------------------------------------- */
const isOpen = ref(false)
const profileDropdownRef = ref<HTMLElement | null>(null)

/* responsive position ------------------------------------------------- */
const { width } = useWindowSize()

const dropdownStyle = computed(() => {
  return width.value < 768
    ? { left: '50%', right: 'auto', transform: 'translateX(-50%)' }
    : { right: '0', left: 'auto', transform: 'none' }
})

const arrowStyle = computed(() => {
  return width.value < 768
    ? {
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(45deg)',
      }
    : {
        right: '32px',
        transform: 'translateY(-50%) rotate(45deg)',
      }
})

/* ui helpers ---------------------------------------------------------- */
const toggleDropdown = () => (isOpen.value = !isOpen.value)
const hideDropdown = () => (isOpen.value = false)

const handleLogout = () => {
  emit('logout')
  hideDropdown()
}

/* outside click & esc key -------------------------------------------- */
onClickOutside(profileDropdownRef, e => {
  if (!profileDropdownRef.value?.contains(e.target as Node)) hideDropdown()
})

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') hideDropdown()
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
/* optional fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
