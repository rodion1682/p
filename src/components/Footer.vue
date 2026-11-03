<template>
  <footer class="footer">
    <div v-if="false" class="footer__links">
      <RouterLink :to="{ name: 'HomePage' }" class="footer__link">
        {{ $t('Home') }}
      </RouterLink>

      <RouterLink :to="{ name: 'ProductListPage' }" class="footer__link">
        {{ $t('Market') }}
      </RouterLink>
      <button
        v-if="isOfferEnabled && false"
        type="button"
        class="footer__link"
        @click="goToSellSkins"
      >
        {{ $t('Sell items') }}
      </button>
      <RouterLink class="footer__link" :to="{ name: 'FAQ' }">
        {{ $t('FAQ') }}
      </RouterLink>
      <button
        type="button"
        class="footer__link"
        v-if="false"
        @click="openContactUsModal"
      >
        {{ $t('Contact') }}
      </button>
    </div>
    <div class="footer__inner _cnt">
      <div class="footer__top">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="footer__logo _ibg-contain"
        >
          <img src="@/assets/img/icons/footer-logo.svg" />
        </RouterLink>
        <div
          data-da=".footer__for-contacts,767.98,first"
          class="footer__contacts"
        >
          <a
            v-if="supportEmailHref"
            :href="supportEmailHref"
            class="footer__email _link"
          >
            <span>
              {{ supportEmail }}
            </span>
          </a>
          <div v-if="socialLinks.length" class="footer__socials">
            <a
              v-for="(social, index) in socialLinks"
              :key="social.id || social.link || index"
              :href="social.link"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__social _ibg-contain"
            >
              <img :src="social.image" :alt="social.title || 'Social'" />
            </a>
          </div>
        </div>
      </div>
      <div class="footer__body">
        <div class="footer__requisites" v-html="requisites" />
        <div v-if="sortedStaticPages.length" class="footer__links">
          <RouterLink
            v-for="page in sortedStaticPages"
            :key="page.id"
            :to="getStaticPagePath(page)"
            class="footer__link"
            :class="{
              active: isStaticPageActive(page),
            }"
          >
            {{ page.title }}
          </RouterLink>
        </div>
        <div class="footer__for-contacts">
          <div class="footer__text">
            <p>
              {{
                $t(
                  'This server is not official and is not affiliated with, endorsed, or sponsored by Facepunch Studios. Rust and all associated properties are trademarks of Facepunch Studios.',
                )
              }}
            </p>
            <p>
              {{ $t('All rights reserved by the original copyright holders.') }}
            </p>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div v-if="footerImages.length" class="footer__methods">
          <div
            v-for="(method, index) in footerImages"
            :key="method.id || method.url || index"
            class="footer__method _ibg-contain"
          >
            <img :src="method.url" :alt="method.title || 'Payment method'" />
          </div>
        </div>
        <div v-if="formattedCopyright" class="footer__copy">
          {{ formattedCopyright }}
        </div>
      </div>
    </div>
  </footer>

  <ContactUsModal :show="isContactUsOpen" @close="closeContactUsModal" />
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import ContactUsModal from '@/components/modals/ContactUsModal.vue'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'

import { useToast } from '@/composables/useToast'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()

const toast = useToast()
const { t } = useI18n()

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const isContactUsOpen = ref(false)

const { serverIP } = storeToRefs(settingsStore)

const copied = ref(false)

const connectCommand = computed(() => {
  if (!serverIP.value) {
    return ''
  }

  return `client.connect ${serverIP.value}`
})

const copyServerIP = async () => {
  if (!connectCommand.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(connectCommand.value)

    copied.value = true

    toast.success(t('Server connect command copied'))

    setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch (error) {
    toast.error(t('Failed to copy server connect command'))

    console.error(error)
  }
}

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

const supportEmail = computed(() => {
  return settingsStore?.supportEmail || ''
})

const supportEmailHref = computed(() => {
  return supportEmail.value ? `mailto:${supportEmail.value}` : '#'
})

const footerImages = computed(() => {
  return (
    settingsStore.settings?.payment_methods
      ?.flatMap(method => method.footer_images || [])
      ?.filter(image => image?.url) || []
  )
})

const requisites = computed(() => {
  return settingsStore?.requisites || ''
})

const formattedCopyright = computed(() => {
  const copyright = settingsStore.settings?.copyright

  if (!copyright) {
    return ''
  }

  const year = new Date().getFullYear()

  let text = copyright

  text = text.replace(/^©\s*\d{4}\s*/, '')
  text = text.replace(/^©\s*/, '')
  text = text.replace(/^\d{4}\s*/, '')
  text = text.replace(/^@\s*\d{4}\.?\s*/, '')

  return `© ${year} ${text.trim()}`
})

const openContactUsModal = () => {
  isContactUsOpen.value = true
}

const closeContactUsModal = () => {
  isContactUsOpen.value = false
}

const scrollToSection = sectionId => {
  const section = document.getElementById(sectionId)
  const header = document.querySelector('.header')

  if (!section) return

  const headerHeight = header?.offsetHeight || 0

  const sectionTop =
    section.getBoundingClientRect().top + window.scrollY - headerHeight

  window.scrollTo({
    top: sectionTop,
    behavior: 'smooth',
  })
}

const scrollToHomeSection = async sectionId => {
  if (route.name !== 'HomePage') {
    await router.push({
      name: 'HomePage',
    })

    await nextTick()
  }

  requestAnimationFrame(() => {
    scrollToSection(sectionId)
  })
}

const goToSellSkins = () => {
  if (!isAuthenticated.value) {
    router.push({
      name: 'LoginPage',
      query: {
        redirect: router.resolve({
          name: 'SellSkinPage',
        }).fullPath,
      },
    })

    return
  }

  router.push({
    name: 'SellSkinPage',
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

onMounted(() => {
  initDynamicAdapt('max')
})

onMounted(async () => {
  if (!pages.value.length) {
    await staticStore.fetchPages()
  }

  if (!settingsStore.settings) {
    await settingsStore.fetchSettings()
  }

  if (
    typeof staticStore.fetchSocialLinks === 'function' &&
    !socialLinks.value.length
  ) {
    await staticStore.fetchSocialLinks()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.footer {
  @include adaptiveValue('padding-top', 56, 30);
  @include adaptiveValue('padding-bottom', 20, 30);
  position: relative;
  z-index: 1;
  background-color: var(--primary-color);
  &__inner {
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include adaptiveValue('gap', 20, 18);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__logo {
    display: block;
    width: fit-content;
    min-width: 247px;
    height: 28px;
  }

  &__contacts {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 20, 18);
    @media (max-width: $md4) {
      justify-content: flex-end;
      flex-wrap: wrap;
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__socials {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
  }

  &__social {
    width: fit-content;
    min-width: 40px;
    height: 40px;
    transition: transform 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        transform: scale(1.03);
      }
    }
  }

  &__email {
    height: fit-content;
    display: block;
    width: fit-content;
  }

  &__body {
    display: flex;
    justify-content: space-between;
    @include adaptiveValue('gap', 20, 18);
    @media (max-width: $md3) {
      flex-wrap: wrap;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__requisites,
  &__text {
    font-size: 12px;
    line-height: 150%;
    color: var(--fourth-color);
  }
  &__requisites {
    @media (min-width: $md4) {
      max-width: 372px;
    }
    @media (max-width: $md4) {
      flex: 1 1 100%;
    }
  }

  &__links {
    display: flex;
    @media (max-width: $md3) {
      @include adaptiveValue('margin-right', -16, -10);
    }
    @media (max-width: $md4) {
      flex-wrap: wrap;
      flex: 1 1 100%;
      @include adaptiveValue('margin-left', -16, -10);
    }
  }

  &__link {
    @include adaptiveValue('padding-left', 16, 10);
    @include adaptiveValue('padding-right', 16, 10);
    padding-top: 8px;
    padding-bottom: 8px;
    white-space: nowrap;
    width: fit-content;
    height: fit-content;
    color: var(--secondary-color);
    font-weight: 700;
    font-size: 14px;
    line-height: 150%;
    border-bottom: 1px solid transparent;
    transition: border 0.3s ease 0s;
    &.router-link-active {
      pointer-events: none;
      border-color: inherit;
    }
    @media (any-hover: hover) {
      &:hover {
        border-color: inherit;
      }
    }
  }

  &__for-contacts {
    max-width: 516px;
    @media (max-width: $md3) {
      max-width: 100%;
      flex: 1 1 100%;
    }
  }

  &__text {
  }

  &__bottom {
    display: flex;
    @include adaptiveValue('gap', 20, 18);
    @media (max-width: $md4) {
      flex-wrap: wrap;
    }
  }

  &__methods {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__method {
    width: fit-content;
    min-width: 63px;
    height: 32px;
  }

  &__copy {
    align-self: center;

    color: var(--secondary-color);
    @media (min-width: $md4) {
      text-align: right;
    }
  }
}
</style>
