<template>
  <div class="enter">
    <div class="enter__inner _cnt-home">
      <div class="enter__bg _ibg">
        <img src="@/assets/img/enter-bg.jpg" />
      </div>
      <div class="enter__content">
        <div class="enter__title _h1">
          {{ $t('ENTER THE ARENA.') }}
        </div>
        <div class="enter__subtitles">
          <div class="enter__subtitle enter__subtitle_left _h5">
            <div>{{ $t('CHOOSE YOUR') }}</div>
            <div>{{ $t('CHAMPION.') }}</div>
          </div>
          <div class="enter__subtitle enter__subtitle_right _h5">
            <div>{{ $t('BUILD YOUR') }}</div>
            <div>{{ $t('DECK.') }}</div>
          </div>
        </div>
        <BaseButton class="enter__button" variant="play" @click="openPlayPage">
          {{ $t('PLAY NOW') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}
</script>

<style lang="scss" scoped>
.enter {
  @include adaptiveValue('padding-top', 130, 30);
  @include adaptiveValue('padding-bottom', 38, 0);
  &__inner {
    @include adaptiveValue('padding-bottom', 52, 30);
    position: relative;

    max-width: 1600px;
  }

  &__bg {
    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 87%;
    @media (max-width: $md6) {
      height: 90%;
    }
    @media (max-width: $md7) {
      height: 95%;
    }
    @media (max-width: $md8) {
      height: 100%;
    }
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 18);
    }
  }

  &__subtitles {
    @include adaptiveValue('padding-bottom', 366, 22);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 18px;
  }

  &__subtitle {
    @include adaptiveValue('font-size', 32, 20);
    color: var(--hint-fourth-color);
    text-shadow: 1px 1px 1px var(--bg-primary-color);
    &_left {
      text-align: left;
    }
    &_right {
      text-align: right;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__button {
    margin: 0 auto;
  }
}
</style>
