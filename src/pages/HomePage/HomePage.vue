<script setup>
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import RulesSection from './components/RulesSection.vue'
import StartSection from './components/StartSection.vue'
import WhySection from './components/WhySection.vue'
</script>

<template>
  <div class="home">
    <HeroSection />
    <AboutSection />
    <WhySection />

    <RulesSection />

    <StartSection />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.home {
}
</style>
