<template>
  <div class="dark">
    <div class="dark__bg _ibg">
      <img src="@/assets/img/dark-bg.jpg" />
    </div>
    <div class="dark__inner _cnt-home">
      <div class="dark__title _h1">
        <div>{{ $t('WHEN THE') }}</div>
        <div>{{ $t('MOON WENT') }}</div>
        <div>{{ $t('DARK') }}</div>
      </div>
      <div class="dark__subtitle _h5">
        {{ $t('The Eclipse is not a natural celestial event.') }}
      </div>
      <div class="dark__text">
        <p>
          {{ $t('At least, that is what the oldest surviving texts claim.') }}
        </p>
        <p>
          {{
            $t(
              'According to forbidden lunar scriptures, an Eclipse occurs when the boundary between Varellune and the world beyond it becomes thin enough to cross.',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'During an Eclipse, dreams become memories. Memories become visions. The dead can hear the living. And silver magic becomes dangerously powerful.',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'Every civilization that attempted to control the Eclipse eventually disappeared.',
            )
          }}
        </p>
        <p>{{ $t('Yet someone — or something — continues to summon it.') }}</p>
      </div>
      <div class="dark__info">
        {{ $t('The next Eclipse is already beginning.') }}
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.dark {
  @include adaptiveValue('padding-top', 95, 25);
  @include adaptiveValue('padding-bottom', 242, 25);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }
  &__subtitle,
  &__text,
  &__info {
    max-width: 564px;
  }
  &__subtitle {
    color: var(--hint-third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__text {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__info {
  }
}
</style>
