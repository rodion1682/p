<template>
  <MoonSection />
  <LegendSection />
  <div id="dark">
    <DarkSection />
  </div>
  <HeroesSection :isBgActive="false" />
  <BuildSection />
  <CardsShowcase />
  <FinalSection />
</template>

<script setup>
import CardsShowcase from '../HomePage/components/CardsShowcase.vue'
import FinalSection from '../HomePage/components/FinalSection.vue'
import HeroesSection from '../HomePage/components/HeroesSection.vue'
import BuildSection from './components/BuildSection.vue'
import DarkSection from './components/DarkSection.vue'
import LegendSection from './components/LegendSection.vue'
import MoonSection from './components/MoonSection.vue'
</script>
