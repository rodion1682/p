<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <div class="footer__info">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="footer__logo _ibg-contain"
        >
          <img src="@/assets/img/logo-full.svg" />
        </RouterLink>
        <div
          v-if="formattedRequisites"
          class="footer__requisites"
          v-html="formattedRequisites"
          data-da-id="footer-requisites"
          data-da=".footer__info,991.98"
        />
      </div>
      <div class="footer__links footer__links_first">
        <button
          class="footer__link"
          :class="{ active: isCS2Active }"
          @click="goToCS2"
        >
          {{ $t('CS2 Skins') }}
        </button>
        <button
          class="footer__link"
          :class="{ active: isDota2Active }"
          @click="goToDota2"
        >
          {{ $t('Dota 2 Skins') }}
        </button>
        <RouterLink
          v-if="false"
          :to="{ name: 'ProductListPage' }"
          class="footer__link"
        >
          {{ $t('Market') }}
        </RouterLink>
        <button
          v-if="isOfferEnabled && false"
          type="button"
          class="footer__link"
          :class="{ active: isSellSkinActive }"
          @click="openSellSkins"
        >
          {{ $t('Sell Skins') }}
        </button>

        <RouterLink v-if="false" :to="{ name: 'FAQ' }" class="footer__link">
          {{ $t('FAQ') }}
        </RouterLink>
        <RouterLink :to="{ name: 'ContactPage' }" class="footer__link">
          {{ $t('Contact us') }}
        </RouterLink>
        <RouterLink
          v-if="false"
          :to="{ name: 'HomePage' }"
          class="footer__link"
        >
          {{ $t('Home') }}
        </RouterLink>
      </div>
      <div
        v-if="sortedStaticPages.length"
        class="footer__links footer__links_last"
      >
        <template v-for="page in sortedStaticPages" :key="page.id">
          <button
            v-if="isCookiePage(page)"
            type="button"
            class="footer__link footer__link_button"
            @click="openCookieSettings"
          >
            {{ formatStaticPageTitle(page) }}
          </button>
          <RouterLink
            v-else
            :to="getStaticPagePath(page)"
            class="footer__link"
            :class="{ active: isStaticPageActive(page) }"
          >
            {{ formatStaticPageTitle(page) }}
          </RouterLink>
        </template>
      </div>
      <div class="footer__about">
        <a :href="supportEmailHref" class="footer__email _link">
          <SvgIcon v-if="false" :icon="EmailIcon" class="footer__email-icon" />
          <span>{{ supportEmail }}</span>
        </a>
        <div v-if="socialLinks.length" class="footer__socials">
          <a
            v-for="social in socialLinks"
            :key="social.id"
            :href="social.link"
            class="footer__socials-link _ibg-contain"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img :src="social.img" />
          </a>
        </div>
        <div v-if="footerImages.length" class="footer__methods">
          <div
            v-for="method in footerImages"
            :key="method.id"
            class="footer__method _ibg-contain"
          >
            <img :src="method.url" alt="" />
          </div>
        </div>
        <div v-if="formattedCopyright" class="footer__copy">
          {{ formattedCopyright }}
        </div>
      </div>
    </div>
  </footer>

  <SellSkinsModal
    v-if="SHOW_SELL_SKIN_MODAL && isSellSkinsOpen && isAuthenticated"
    v-model="isSellSkinsOpen"
    @close="isSellSkinsOpen = false"
  />
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { EmailIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinModal/SellSkinsModal.vue'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'

const SHOW_SELL_SKIN_MODAL = false

const emit = defineEmits(['open-cookie-settings'])

const route = useRoute()
const router = useRouter()

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const isSellSkinsOpen = ref(false)

const pages = computed(() => {
  return staticStore.pages || []
})

const socialLinks = computed(() => {
  return staticStore.socialLinks || []
})

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

const isOfferEnabled = computed(() => {
  return settingsStore.isOfferEnabled
})

const isSellSkinActive = computed(() => {
  if (SHOW_SELL_SKIN_MODAL) {
    return isSellSkinsOpen.value
  }

  return route.name === 'SellSkisnPage'
})

const supportEmail = computed(() => {
  return settingsStore.supportEmail || ''
})

const supportEmailHref = computed(() => {
  return supportEmail.value ? `mailto:${supportEmail.value}` : '#'
})

const footerImages = computed(() => {
  return settingsStore.settings?.footer_images || []
})

const formattedRequisites = computed(() => {
  return settingsStore.requisites
    ? settingsStore.requisites.replace(/\n/g, '<br>')
    : ''
})

const formattedCopyright = computed(() => {
  const copyright = settingsStore.settings?.copyright

  if (!copyright) return ''

  const year = new Date().getFullYear()

  const text = copyright
    .replace(/^©\s*\d{4}\s*/, '')
    .replace(/^©\s*/, '')
    .replace(/^\d{4}\s*/, '')
    .trim()

  return `© ${year} ${text}`
})

const isCS2Active = computed(
  () => route.name === 'ProductListPage' && route.query.category === 'cs2',
)

const isDota2Active = computed(
  () => route.name === 'ProductListPage' && route.query.category === 'dota2',
)

const goToCS2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'cs2' },
  })
}

const goToDota2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'dota2' },
  })
}

const openSellSkins = () => {
  if (!isAuthenticated.value) {
    router.push({
      name: 'LoginPage',
      query: {
        redirect: route.fullPath,
      },
    })

    return
  }

  if (SHOW_SELL_SKIN_MODAL) {
    isSellSkinsOpen.value = true
    return
  }

  router.push({
    name: 'SellSkisnPage',
  })
}

const pageSlug = page => {
  if (page?.slug) {
    return page.slug
  }

  if (page?.is_terms) {
    return 'terms-and-conditions'
  }

  if (page?.is_privacy) {
    return 'privacy-policy'
  }

  if (page?.is_cookie) {
    return 'cookie-notice'
  }

  const title = String(page?.title || '').toLowerCase()

  if (title.includes('cookie')) {
    return 'cookie-notice'
  }

  return null
}

const getStaticPagePath = page => {
  const slug = pageSlug(page)

  return slug ? `/${slug}` : '/'
}

const isStaticPageActive = page => {
  const currentSlug = route.params.slug

  return typeof currentSlug === 'string' && currentSlug === pageSlug(page)
}

const isCookiePage = page => {
  return page?.is_cookie === 1 || pageSlug(page) === 'cookie-notice'
}

const openCookieSettings = () => {
  emit('open-cookie-settings')
}

const sortedStaticPages = computed(() => {
  const order = ['privacy-policy', 'cookie-notice', 'terms-and-conditions']

  return [...pages.value]
    .map(page => ({
      ...page,
      __slug: pageSlug(page),
    }))
    .filter(page => page.__slug)
    .sort((a, b) => {
      return order.indexOf(a.__slug) - order.indexOf(b.__slug)
    })
})

const formatStaticPageTitle = page => {
  return String(page?.title ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

onMounted(async () => {
  await Promise.all([
    !pages.value.length ? staticStore.fetchPages() : Promise.resolve(),

    !settingsStore.settings ? settingsStore.fetchSettings() : Promise.resolve(),

    typeof staticStore.fetchSocialLinks === 'function' &&
    !socialLinks.value.length
      ? staticStore.fetchSocialLinks()
      : Promise.resolve(),
  ])

  await nextTick()

  initDynamicAdapt('max')
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;
.footer {
  max-width: 1720px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  background-color: var(--bg-primary-color);
  @include adaptiveValue('border-radius', 50, 8);
  @include adaptiveValue('padding-top', 40, 30);
  @include adaptiveValue('padding-bottom', 30, 20);
  &__inner {
    display: flex;
    width: 100%;
    gap: 20px;
    @media (max-width: $md2) {
      flex-wrap: wrap;
    }
  }

  &__info {
    @media (min-width: $md2) {
      max-width: 345px;
    }
    @media (max-width: $md2) {
      order: 1;
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md4) {
      flex: 1 1 100%;
    }
  }

  &__logo {
    display: block;
    width: fit-content;
    min-width: 188px;
    height: 54px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__requisites {
    color: var(--seventh-color);
  }

  &__links {
    @media (max-width: $md2) {
      order: 3;
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md4) {
      order: 2;
    }
    &_first {
      margin-left: auto;
    }
    &_last {
      margin-right: auto;
    }
  }

  &__link {
    display: block;
    width: fit-content;
    font-size: 16px;
    text-transform: none;
    font-weight: 700;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: transparent;
    color: var(--border-primary-color);
    @include adaptiveValue('padding-left', 70, 0, 1470, 992, 1);
    @include adaptiveValue('padding-right', 70, 0, 1470, 992, 1);
    &.router-link-active,
    &.active {
      color: var(--hint-primary-color);
      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
    &_button {
    }
  }

  &__about {
    width: fit-content;
    display: flex;
    flex-direction: column;
    @media (max-width: $md2) {
      order: 2;
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md4) {
      flex: 1 1 100%;
      order: 3;
    }
  }

  &__email {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__socials {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    &:not(:last-child) {
      margin-bottom: 20px;
    }
    &-link {
      width: fit-content;
      min-width: 30px;
      height: 30px;
      transition: transform 0.3s ease 0s;
      @media (any-hover: hover) {
        &:hover {
          transform: scale(1.03);
        }
      }
    }
  }

  &__methods {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__method {
    min-width: 50px;
    height: 37px;
  }

  &__copy {
    color: var(--border-secondary-color);
    line-height: 120%;
  }
}
</style>
