<script setup>
import { useModalStore } from '@/stores/modal'
import AboutSection from './components/AboutSection.vue'
import BattlefieldSection from './components/BattlefieldSection.vue'
import BuildSection from './components/BuildSection.vue'
import EnterSection from './components/EnterSection.vue'
import EvolvedSection from './components/EvolvedSection.vue'
import HeroSection from './components/HeroSection.vue'
import HeroesSection from './components/HeroesSection.vue'

const modalStore = useModalStore()

const handleModalClose = () => {
  modalStore.close('hero')
}
</script>

<template>
  <HeroSection />
  <AboutSection />
  <HeroesSection />
  <EnterSection />
  <BuildSection />
  <BattlefieldSection />
  <EvolvedSection />
</template>
