<script setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/header/Header.vue'
import CookieModal from '@/components/modals/CookieModal.vue'
</script>

<template>
  <div class="layout">
    <Header />
    <main class="layout__main">
      <slot />
    </main>
    <Footer />
    <CookieModal />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  &__main {
    flex: 1 1 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
