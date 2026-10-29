<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import Footer from '@/components/Footer.vue'
import Header from '@/components/header/Header.vue'
import CookieModal from '@/components/modals/CookieModal.vue'

import { useStaticPages } from '@/composables/useStaticPages'

const router = useRouter()

const headerRef = ref(null)
const cookieModalRef = ref(null)

const { cookiePage, ensurePages, getPageUrl } = useStaticPages()

const openContactFromFooter = () => {
  headerRef.value?.openContactModal?.()
}

const openCookieSettings = async () => {
  await ensurePages()

  if (!cookiePage.value) {
    console.warn('Cookie static page was not found')
    return
  }

  const pageUrl = getPageUrl(cookiePage.value)

  if (!pageUrl) {
    console.warn('Cookie static page URL could not be resolved')
    return
  }

  await router.push(pageUrl)

  await nextTick()

  cookieModalRef.value?.showBanner?.()
}
</script>

<template>
  <div class="layout">
    <Header ref="headerRef" />

    <main class="layout__main">
      <slot />
    </main>

    <Footer
      @open-cookie-settings="openCookieSettings"
      @open-contact="openContactFromFooter"
    />

    <CookieModal ref="cookieModalRef" />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.layout {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;

  &__main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }
}
</style>
