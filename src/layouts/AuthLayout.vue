<template>
  <div class="auth">
    <div class="auth__bg _ibg">
      <img src="@/assets/img/hero-bg.png" />
    </div>
    <div class="auth__inner _cnt">
      <div class="auth__form" :class="formClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  page: {
    type: String,
    default: 'sign-in', // sign-in | sign-up
  },
  formClass: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.auth {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  align-items: center;
  position: relative;
  z-index: 2;
  @include adaptiveValue('padding-top', 130, 25);
  @include adaptiveValue('padding-bottom', 80, 25);
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  &__inner {
    width: 100%;
    align-self: center;
    margin: auto;
    z-index: 1;
  }

  &__form {
    position: relative;
    z-index: 3;
    max-width: 466px;
    margin-right: auto;
  }
}
</style>
