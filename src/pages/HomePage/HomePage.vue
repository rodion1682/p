<script setup>
import { useModalStore } from '@/stores/modal'
import BuildSection from './components/BuildSection.vue'
import CardsShowcase from './components/CardsShowcase.vue'
import FinalSection from './components/FinalSection.vue'
import HeroSection from './components/HeroSection.vue'
import HeroesSection from './components/HeroesSection.vue'
import TruthSection from './components/TruthSection.vue'
import UniverseSection from './components/UniverseSection.vue'
import WorldSection from './components/WorldSection.vue'

const modalStore = useModalStore()

const handleModalClose = () => {
  modalStore.close('hero')
}
</script>

<template>
  <HeroSection />
  <UniverseSection />
  <HeroesSection />
  <TruthSection />
  <BuildSection />

  <CardsShowcase />
  <WorldSection />
  <FinalSection />
</template>
