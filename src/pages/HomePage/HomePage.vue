<script setup>
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import ExploreSection from './components/ExploreSection.vue'
import FaqSection from './components/FaqSection.vue'
import HowSection from './components/HowSection.vue'
import RulesSection from './components/RulesSection.vue'
import StartSection from './components/StartSection.vue'
import WhatSection from './components/WhatSection.vue'
import WhySection from './components/WhySection.vue'
</script>

<template>
  <div class="home">
    <div class="home__block">
      <div class="home__bg home__bg_hero _ibg">
        <img src="@/assets/img/hero-bg.jpg" />
      </div>
      <HeroSection />
      <WhySection />
    </div>

    <ExploreSection />
    <div class="home__block">
      <div class="home__bg _ibg">
        <img src="@/assets/img/how-bg.jpg" />
      </div>
      <HowSection />
      <WhatSection />
    </div>
    <FaqSection />
    <div class="home__block">
      <div class="home__bg home__bg_start _ibg">
        <img src="@/assets/img/start-bg.jpg" />
      </div>
      <RulesSection />
      <StartSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.home {
  &__block {
    position: relative;
  }
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    &_start {
      height: 90%;
      top: auto;
      bottom: 0;
    }
  }
}
</style>
