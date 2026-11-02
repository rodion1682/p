
<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['coming-soon__inner']"
    @close="emit('close')"
  >
    <div class="coming-soon">
      <div class="coming-soon__icon">
        <svg
          width="52"
          height="52"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="currentColor"
            stroke-width="2.5"
          />
          <path
            d="M24 13V24L31 29"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <h2>{{ $t('COMING SOON') }}</h2>
      <p>{{ $t('Selling skins is not available yet.') }}</p>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
</script>

<style scoped lang="scss">
.coming-soon {
  padding: 28px 18px;
  text-align: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 92px;
    height: 92px;
    margin: 0 auto 24px;
    border-radius: 50%;
    background: #242936;
    color: #fff;
  }

  h2 {
    margin: 0 0 14px;
    font-size: 26px;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    opacity: 0.75;
  }
}

:global(.coming-soon-sell-modal) {
  max-width: 440px;
}
</style>
