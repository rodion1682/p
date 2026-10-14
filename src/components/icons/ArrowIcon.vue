<template>
  <svg
    :class="[
      'transition-transform duration-300',
      direction === 'right' ? 'rotate-180' : '',
    ]"
    :width="width"
    :height="height"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_57_2450)">
      <path
        d="M6.6665 16H25.3332"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.6665 16L14.6665 24"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.6665 16L14.6665 8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_57_2450">
        <rect width="32" height="32" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
</template>

<script>
export default {
  props: {
    direction: {
      type: String,
      validator: value => ['left', 'right'].includes(value),
      default: 'left',
    },
    width: {
      type: String,
      default: '32',
    },
    height: {
      type: String,
      default: '16',
    },
  },
}
</script>
