<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'

import { useToast } from '@/composables/useToast'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const toast = useToast()
const { t } = useI18n()

const { serverIP } = storeToRefs(settingsStore)

const copied = ref(false)

const connectCommand = computed(() => {
  if (!serverIP.value) {
    return ''
  }

  return `client.connect ${serverIP.value}`
})

const copyServerIP = async () => {
  if (!connectCommand.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(connectCommand.value)

    copied.value = true

    toast.success(t('Server connect command copied'))

    setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch (error) {
    toast.error(t('Failed to copy server connect command'))

    console.error(error)
  }
}
</script>

<template>
  <section class="hero">
    <div class="hero__inner _cnt-home">
      <div class="hero__title">
        <div class="_h2">{{ $t('THE WORLD ENDED.') }}</div>
        <span class="_h1">{{ $t('YOUR STORY DIDN’T.') }}</span>
      </div>
      <div class="hero__subtitle _h3">
        {{ $t('Survive the Chaos. Build Your Legacy.') }}
      </div>
      <div class="hero__text">
        <p>
          {{
            $t(
              'Enter WastelandCore, a Rust survival experience where every resource matters, every encounter carries a risk, and every decision shapes your future. Explore a hostile world, construct fortified bases, challenge rival survivors, and collect valuable items along the way.',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'Need better equipment or want to sell items you’ve collected? The WastelandCore Shop gives you a convenient way to buy and sell in-game items while preparing for your next adventure.',
            )
          }}
        </p>
      </div>
      <div class="hero__actions">
        <div class="hero__button"></div>
        <BaseButton class="hero__button" variant="shadow">
          {{ $t('JOIN THE MARKET') }}
        </BaseButton>
        <div v-if="serverIP" class="hero__connect">
          <div class="hero__icon _ibg-contain">
            <img src="@/assets/img/server.svg" />
          </div>
          <div class="hero__meta">
            <div class="hero__label">{{ $t('Connect to Server') }}</div>
            <div class="hero__ip">{{ serverIP }}</div>
          </div>
          <BaseButton
            class="hero__copy"
            variant="dark"
            :disabled="!connectCommand"
            @click="copyServerIP"
          >
            {{ $t('COPY IP') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.hero {
  @include adaptiveValue('padding-top', 97, 25);
  @include adaptiveValue('padding-bottom', 234, 25);
  position: relative;
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-image: url('../../../assets/img/hero-bg-mask.svg');
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      z-index: 1;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
    max-width: 1260px;
  }

  &__title {
    span {
      display: block;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__info {
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__subtitle {
    text-align: right;
    span {
      display: block;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__connect {
    width: fit-content;
    margin-left: auto;
    @include adaptiveValue('padding', 16, 10);
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--border-primary-color);
    background-color: var(--bg-third-color);
  }

  &__icon {
    min-width: 32px;
    height: 32px;
  }

  &__meta {
    line-height: 120%;
    padding-right: 15px;
  }

  &__label {
    white-space: nowrap;
    font-size: 12px;
    text-transform: capitalize;
    color: var(--hint-primary-color);
    font-weight: 700;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  &__ip {
    white-space: nowrap;
    font-size: 16px;
    font-weight: 700;
  }

  &__copy {
    max-width: 73px;
  }
  &__text {
    max-width: 337px;
  }
}
</style>
