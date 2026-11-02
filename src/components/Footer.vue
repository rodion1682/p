<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <div class="footer__top">
        <div v-if="serverIP" class="footer__connect connect">
          <div class="connect__icon _ibg-contain">
            <img src="@/assets/img/server.svg" />
          </div>
          <div class="connect__meta">
            <div class="connect__label">{{ $t('Connect to Server') }}</div>
            <div class="connect__ip">{{ serverIP }}</div>
          </div>
          <BaseButton
            class="connect__copy"
            variant="hint-bordered"
            :disabled="!connectCommand"
            @click="copyServerIP"
          >
            {{ $t('COPY') }}
          </BaseButton>
        </div>
        <div class="footer__logo-wrapper">
          <RouterLink
            :to="{ name: 'HomePage' }"
            class="footer__logo _ibg-contain"
          >
            <img src="@/assets/img/icons/footer-logo.svg" />
          </RouterLink>
        </div>
        <div class="footer__contacts">
          <a :href="supportEmailHref" class="footer__email _link">
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
              class="footer__social-box"
            >
              <div class="footer__social _ibg-contain">
                <img :src="social.image" :alt="social.title || 'Social'" />
              </div>
            </a>
          </div>
        </div>
      </div>
      <div class="footer__body">
        <div class="footer__requisites" v-html="requisites" />
        <div class="footer__links">
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
        <div class="footer__text">
          <p>
            {{
              $t(
                'This server is not official and is not affiliated with, endorsed, or sponsored by Facepunch Studios. Rust and all associated properties are trademarks of Facepunch Studios.',
              )
            }}
          </p>
          <p>
            {{ $t('All rights reserved by the original copyright holders') }}
          </p>
        </div>
      </div>
      <div class="footer__bottom">
        <div v-if="footerImages.length" class="footer__methods">
          <div
            v-for="(method, index) in footerImages"
            :key="method.id || method.url || index"
            class="footer__method-box"
          >
            <div class="footer__method _ibg-contain">
              <img :src="method.url" :alt="method.title || 'Payment method'" />
            </div>
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
import BaseButton from '@/components/base/BaseButton.vue'
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
  @include adaptiveValue('padding-top', 24, 25);
  @include adaptiveValue('padding-bottom', 24, 25);
  background-color: var(--bg-primary-color);
  border: 1px solid var(--bg-sixth-color);
  &__inner {
  }

  &__top {
    display: flex;
    align-items: center;
    column-gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 48, 15);
    }
    @media (max-width: $md3) {
      flex-wrap: wrap;
      row-gap: 15px;
    }
  }

  &__connect {
    max-width: 317px;
    @media (max-width: $md3) {
      order: 2;
    }
    @media (max-width: $md5) {
      max-width: 100%;
    }
  }
  &__logo-wrapper {
    margin: 0 auto;
    @media (max-width: $md3) {
      order: 1;
      flex: 1 1 100%;
    }
  }
  &__logo {
    display: block;
    width: fit-content;
    min-width: 155px;
    height: 120px;
    @media (max-width: $md3) {
      margin: 0 auto;
    }
  }

  &__contacts {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    column-gap: 20px;
    row-gap: 15px;
    @media (max-width: $md3) {
      order: 3;
      margin-left: auto;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
  }

  &__email {
    align-self: center;
    height: fit-content;
    width: fit-content;
  }

  &__socials {
    display: flex;
    @include adaptiveValue('gap', 12, 10);
  }

  &__social-box {
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background-color: rgb(255, 255, 255, 0.1);
    border: 1px solid rgb(255, 255, 255, 0.2);
    transition: all 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-sixth-color);
        border-color: var(--border-primary-color);
      }
    }
  }

  &__social {
    width: fit-content;
    min-width: 24px;
    height: 24px;
  }

  &__body {
    display: flex;
    justify-content: space-between;
    column-gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 48, 15);
    }
    @media (max-width: $md3) {
      flex-wrap: wrap;
      row-gap: 15px;
    }
  }

  &__requisites {
    width: 100%;
    max-width: 350px;
    @include adaptiveValue('font-size', 12, 14);
    line-height: 150%;
    opacity: 0.5;
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
      order: 2;
      max-width: 100%;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
  }

  &__links {
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
      order: 1;
      margin-left: -10px;
      margin-right: -10px;
    }
    @media (max-width: 374.98px) {
      flex: 1 1 100%;
    }
  }

  &__link {
    display: block;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 14px;
    line-height: 100%;
    white-space: nowrap;
    text-transform: capitalize;
    font-weight: 700;
    font-family: var(--font-open-sans);
    color: var(--primary-color);
    background-color: transparent;
    width: fit-content;
    text-align: center;
    @include adaptiveValue('padding-left', 80, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 80, 10, 1400, 992, 1);
    &.router-link-active {
      pointer-events: none;
      color: var(--hint-primary-color);
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
    @media (max-width: $md3) {
      width: 100%;
    }
  }

  &__text {
    width: 100%;
    max-width: 350px;
    @include adaptiveValue('font-size', 12, 14);
    line-height: 150%;
    opacity: 0.5;
    p {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 24, 15);
      }
    }
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
      order: 3;
      max-width: 100%;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
  }

  &__bottom {
    @media (min-width: $md5) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
  }

  &__methods {
    display: flex;
    gap: 4px;
    @media (max-width: $md5) {
      justify-content: center;
      flex-wrap: wrap;
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__method-box {
    min-width: 63px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #00030c;
    border: 1px solid rgb(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  &__method {
    width: fit-content;
    min-width: 50px;
    height: 17px;
  }

  &__copy {
    opacity: 0.5;
    text-align: right;
    @media (max-width: $md3) {
      max-width: 100%;
      flex: 0 1 calc(50% - 10px);
    }
  }
}

.connect {
  height: fit-content;
  width: 100%;
  @include adaptiveValue('padding', 16, 10);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-primary-color);
  background-color: var(--bg-third-color);
  &__icon {
    min-width: 32px;
    height: 32px;
  }

  &__meta {
    line-height: 120%;
    padding-right: 15px;
  }

  &__label {
    white-space: nowrap;
    @include adaptiveValue('font-size', 12, 14);
    text-transform: capitalize;
    color: var(--hint-primary-color);
    font-weight: 700;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  &__ip {
    white-space: nowrap;
    font-size: 16px;
    font-weight: 700;
  }

  &__copy {
    margin-left: auto;
    max-width: 73px;
    @media (max-width: $md5) {
      max-width: 200px;
    }
  }
}
</style>
