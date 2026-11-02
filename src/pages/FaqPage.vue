<template>
  <div class="faq">
    <div class="faq__bg _ibg">
      <img src="@/assets/img/faq-bg.jpg" />
    </div>
    <div class="faq__inner _cnt">
      <FaqSection />
    </div>
  </div>
</template>

<script setup>
import FaqSection from '@/pages/HomePage/components/FaqSection.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.faq {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  @include adaptiveValue('padding-top', 128, 75);
  @include adaptiveValue('padding-bottom', 120, 25);
  position: relative;
  @include adaptiveValue('margin-top', -78, -50, 1430, 992, 1);
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  &__inner {
    position: relative;
    z-index: 1;
    flex: 1 1 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
