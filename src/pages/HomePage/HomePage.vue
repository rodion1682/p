<script setup>
import CategorySection from '@/pages/HomePage/components/CategorySection.vue'
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import TrandingSection from './components/TrandingSection.vue'
import WhySection from './components/WhySection.vue'
</script>

<template>
  <div class="home">
    <HeroSection />
    <CategorySection />
    <WhySection />
    <TrandingSection />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.home {
}
</style>
