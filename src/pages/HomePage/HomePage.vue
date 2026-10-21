<script setup>
import { useModalStore } from '@/stores/modal'
import AboutSection from './components/AboutSection.vue'
import EnterSection from './components/EnterSection.vue'
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
</template>
