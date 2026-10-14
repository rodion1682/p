<template>
  <div :class="[badgeStyle, 'hover:filter hover:drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]']" class="relative transition-all">
    <img
      v-if="type === 'top-product'"
      src="../assets/images/star.svg"
      alt="Star Icon"
      class="absolute left-[6px] top-1/2 -translate-y-1/2 h-[16px] w-fit"
    />
    {{ displayText }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['top-product', 'new-arrivals', 'sale'].includes(value),
  },
})

const badgeStyle = computed(() => {
  const baseStyle = 'w-fit h-[30px] rounded-[5px] text-[16px] leading-[19px] font-medium flex items-center justify-center px-4'
  
  switch (props.type) {
    case 'top-product':
      return `${baseStyle} bg-accent text-secondary pl-8 border-2 border-accent`
    case 'new-arrivals':
      return `${baseStyle} bg-success text-primary border-2 border-success`
    case 'sale':
      return `${baseStyle} bg-error text-primary border-2 border-error`
    default:
      return ''
  }
})

const displayText = computed(() => {
  switch (props.type) {
    case 'top-product':
      return t('TOP')
    case 'new-arrivals':
      return t('NEW')
    case 'sale':
      return t('SALE')
    default:
      return ''
  }
})
</script>
