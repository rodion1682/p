<script setup>
import { computed, useSlots } from 'vue'
import { twMerge } from 'tailwind-merge'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  class: { type: [String, Array, Object], default: '' },
  backgroundImage: { type: String, default: '' },
})

const slots = useSlots()

const baseButtonClasses = `rounded-[24px]
  relative inline-flex items-center justify-center
  font-sans font-medium text-[16px] leading-[24px]
  border outline-[unset]
  overflow-hidden transition duration-300
  cursor-pointer disabled:cursor-not-allowed disabled:opacity-60
  hover:filter
  uppercase
`

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-4 py-2 h-[45px]'
    case 'lg':
      return 'px-8 py-3 h-[56px] text-[16px]'
    case 'md':
    default:
      return 'px-[15px] h-[46px] py-2 '
  }
})

const variantButtonClasses = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'shadow-[0_2px_12px_0_#000000AB] hover:shadow-[0px_4px_4px_0px_#00EEFF4D] bg-gradient-to-b from-[#6D6D6D] border-0 to-[#2A2A2A] text-white rounded-[24px]  hover:text-accent hover:border-accent'
    default:
      return 'shadow-[0_2px_12px_0_#000000AB] bg-gradient-to-b from-[#6D6D6D] border-0 to-[#2A2A2A] text-white rounded-[24px]  hover:text-accent hover:border-accent'
  }
})

const hasAddons = computed(() => slots.prefix || slots.postfix)

const buttonClasses = computed(() =>
  twMerge(
    baseButtonClasses,
    sizeClasses.value,
    variantButtonClasses.value,
    hasAddons.value ? 'gap-[20px]' : '',
    props.class,
  ),
)

const backgroundStyle = computed(() => {
  if (!props.backgroundImage) return {}
  return {
    backgroundImage: `url(${props.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    :style="backgroundStyle"
    class="group"
  >
    <div
      class="absolute left-0 top-0 h-full w-full rounded-[24px] border-[2px] border-white/10 transition duration-300 group-hover:border-accent"
    ></div>
    <template v-if="slots.prefix">
      <div class="flex items-center">
        <slot name="prefix" />
      </div>
    </template>
    <div class="flex items-center">
      <slot />
    </div>
    <template v-if="slots.postfix">
      <div class="flex items-center">
        <slot name="postfix" />
      </div>
    </template>
  </button>
</template>
