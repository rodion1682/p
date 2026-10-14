<script setup>
defineProps({
  width: {
    type: String,
    default: '164px',
  },
  height: {
    type: String,
    default: '58px',
  },
  innerComponent: {
    type: String,
    default: 'button',
  },
  to: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <component
    :is="to ? 'RouterLink' : 'div'"
    :to="to"
    class="relative inline-block !opacity-100"
  >
    <div class="group relative" :style="`width: ${width}; height: ${height};`">
      <!-- Outer gradient background -->
      <div
        class="absolute left-0 top-0 h-full w-full rounded-[29px] transition-all duration-300"
        style="
          background: linear-gradient(
            180deg,
            rgba(239, 128, 18, 0.3) 0%,
            rgba(203, 63, 8, 0.3) 100%
          );
        "
      ></div>

      <!-- Inner gradient background -->
      <div
        class="absolute left-[6px] top-[6px] flex items-center justify-center rounded-[23px]"
        :style="`width: calc(100% - 12px); height: calc(100% - 12px);`"
        style="background: linear-gradient(180deg, #ef8012 0%, #cb3f08 100%)"
      >
        <slot></slot>
      </div>

      <!-- Hover effect outer border -->
      <div
        class="absolute left-[-6px] top-[-6px] z-[-1] rounded-[35px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        :style="`width: calc(100% + 12px); height: calc(100% + 12px);`"
        style="
          background: linear-gradient(
            180deg,
            rgba(239, 128, 18, 0.3) 0%,
            rgba(203, 63, 8, 0.3) 100%
          );
        "
      ></div>

      <!-- Hover state background change -->
      <div
        class="absolute left-0 top-0 z-[-1] h-full w-full rounded-[29px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style="
          background: linear-gradient(
            180deg,
            rgba(239, 128, 18, 0.4) 0%,
            rgba(203, 63, 8, 0.4) 100%
          );
        "
      ></div>
    </div>
  </component>
</template>
