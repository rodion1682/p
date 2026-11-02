<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  title: { type: String, default: '', required: true },
})

const router = useRouter()

const handleBack = () => {
  if (
    window.history.length > 1 &&
    document.referrer &&
    document.referrer.includes(window.location.host)
  ) {
    router.go(-1)
  } else {
    router.push({ name: 'HomePage' })
  }
}
</script>

<template>
  <div class="crumbs">
    <BaseButton
      @click="handleBack"
      variant="gray-transparent"
      class="crumbs__button"
    >
      {{ $t('Back') }}</BaseButton
    >
    <div class="crumbs__title _l">{{ title }}</div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.crumbs {
  display: flex;
  @include adaptiveValue('gap', 20, 10);
  &__button {
    width: fit-content;
  }
  &__title {
    align-self: center;
  }
}
</style>
