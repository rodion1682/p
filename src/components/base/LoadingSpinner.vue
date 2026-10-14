<template>
  <span :class="['loader', className]"></span>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
.loader {
  display: inline-block;

  box-sizing: border-box;
  min-width: 50px;
  max-width: 50px;
  min-height: 50px;
  max-height: 50px;

  margin: auto;

  border-width: 5px;
  border-style: solid;
  border-color: var(--primary-color);
  border-radius: 50%;

  animation: rotation 1s linear infinite;

  border-bottom-color: transparent;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
