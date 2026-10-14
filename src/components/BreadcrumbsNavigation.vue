<template>
  <nav
    :class="twMerge('mb-[24px] text-nowrap pt-[16px] text-white', $attrs.class)"
  >
    <ul
      :class="twMerge('flex flex-wrap items-center text-[16px] leading-[19px]')"
    >
      <li
        v-for="(crumb, index) in breadcrumbItems"
        :key="index"
        class="flex items-center"
      >
        <template v-if="crumb.link">
          <router-link
            :to="crumb.link"
            :class="twMerge('text-white transition-colors hover:text-primary')"
          >
            {{ crumb.text }}
          </router-link>
        </template>
        <template v-else>
          <span class="text-white/50">{{ crumb.text }}</span>
        </template>

        <!-- Custom divider -->
        <svg
          v-if="index < breadcrumbItems.length - 1"
          class="mx-[16px]"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 0.5L7.21115 3.60557C7.94819 3.9741 7.94819 5.0259 7.21115 5.39443L1 8.5"
            stroke="#F5F5F5"
            stroke-opacity="0.5"
          />
        </svg>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { twMerge } from 'tailwind-merge'
import { useAttrs, computed } from 'vue'

const $attrs = useAttrs()

const props = defineProps({
  breadcrumbs: {
    type: Array,
    required: true,
    validator: value => {
      return value.every(crumb => {
        // Each crumb must have text
        if (!crumb?.text) return false

        // If link exists, validate its format
        if (crumb.link) {
          if (typeof crumb.link !== 'string') return false
          if (crumb.link.includes('/products')) {
            return !crumb.link.endsWith('/products')
          }
        }

        return true
      })
    },
  },
})

// Use computed property to access props safely
const breadcrumbItems = computed(() => props.breadcrumbs)
</script>
