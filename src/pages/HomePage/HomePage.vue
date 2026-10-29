<script setup>
import CategorySection from '@/pages/HomePage/components/CategorySection.vue'
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import FaqListSection from '../FaqPage/components/FaqListSection.vue'
import GamesSection from './components/GamesSection.vue'
import HowSection from './components/HowSection.vue'
import ReadySection from './components/ReadySection.vue'
import TrandingSection from './components/TrandingSection.vue'
import WhySection from './components/WhySection.vue'
</script>

<template>
  <div class="home">
    <HeroSection />
    <CategorySection />
    <WhySection />

    <div class="home__bg">
      <TrandingSection />
      <HowSection />
      <GamesSection />
    </div>
    <div id="faq">
      <FaqListSection />
    </div>
    <ReadySection />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.home {
  &__bg {
    position: relative;
    overflow: hidden;
    &::before {
      content: '';
      position: absolute;
      z-index: -1;
      left: 0;
      top: 17%;
      width: 100%;
      height: 58%;
      background-image: url('@/assets/img/home-bg.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      @media (max-width: $md2) {
        height: 65%;
      }
      @media (max-width: $md3) {
        height: 74%;
      }
    }
  }
}
</style>
