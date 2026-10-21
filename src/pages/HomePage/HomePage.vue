<script setup>
import { useModalStore } from '@/stores/modal'
import AboutSection from './components/AboutSection.vue'
import AdventureSection from './components/AdventureSection.vue'
import BuildSection from './components/BuildSection.vue'
import HeroSection from './components/HeroSection.vue'
import HeroesSection from './components/HeroesSection.vue'
import UniverseSection from './components/UniverseSection.vue'
import WhySection from './components/WhySection.vue'

const modalStore = useModalStore()

const handleModalClose = () => {
  modalStore.close('hero')
}
</script>

<template>
  <HeroSection />
  <AboutSection />
  <UniverseSection />
  <HeroesSection />
  <BuildSection />
  <WhySection />
  <AdventureSection />
</template>
