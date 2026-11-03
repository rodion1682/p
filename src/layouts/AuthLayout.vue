<template>
  <div class="auth">
    <div class="auth__bg _ibg">
      <img src="@/assets/img/start-bg.jpg" />
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
    default: 'in', // in | up | recover
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
  position: relative;
  overflow: hidden;
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  @include adaptiveValue('padding-top', 158, 80);
  @include adaptiveValue('padding-bottom', 100, 30);
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
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
    width: 100%;
  }
  &__form {
    margin: auto;
    max-width: 600px;
    width: 100%;
    border-radius: 6px;
    background-color: var(--bg-third-color);
    border: 1px solid var(--border-primary-color);
    @include adaptiveValue('padding', 50, 10);
  }
}
</style>
