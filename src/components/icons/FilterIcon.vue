<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_34_1697)">
      <path
        d="M0 4C0 3.55817 0.358172 3.2 0.8 3.2H15.2C15.6418 3.2 16 3.55817 16 4C16 4.44182 15.6418 4.8 15.2 4.8H0.8C0.358173 4.8 0 4.44182 0 4Z"
        :fill="color"
      />
      <path
        d="M2.3999 8C2.3999 7.55817 2.75808 7.2 3.1999 7.2H12.7999C13.2417 7.2 13.5999 7.55817 13.5999 8C13.5999 8.44184 13.2417 8.8 12.7999 8.8H3.1999C2.75808 8.8 2.3999 8.44184 2.3999 8Z"
        :fill="color"
      />
      <path
        d="M6.4001 11.2C5.95827 11.2 5.6001 11.5582 5.6001 12C5.6001 12.4418 5.95827 12.8 6.4001 12.8H9.6001C10.0419 12.8 10.4001 12.4418 10.4001 12C10.4001 11.5582 10.0419 11.2 9.6001 11.2H6.4001Z"
        :fill="color"
      />
    </g>
    <defs>
      <clipPath id="clip0_34_1697">
        <rect width="16" height="16" :fill="color" />
      </clipPath>
    </defs>
  </svg>
</template>

<script setup>
const props = defineProps({
  color: {
    type: String,
    default: '#fff',
  },
})
</script>
