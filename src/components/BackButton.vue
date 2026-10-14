<!-- components/BackButton.vue -->
<script setup lang="ts">
import ArrowIcon from '@/components/icons/ArrowIcon.vue'

defineEmits(['click'])
</script>

<template>
  <button
    class="flex items-center gap-2 text-sm hover:opacity-80"
    @click="$emit('click')"
  >
    <ArrowIcon direction="left" />
    <slot />
  </button>
</template>
