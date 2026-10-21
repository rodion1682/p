<template>
  <BaseModal
    :show="show"
    size="product"
    class="hero-details-modal"
    labelledby="hero-details-title"
    @close="$emit('close')"
  >
    <div v-if="hero" class="hero-details" :style="{ '--hero-accent': accent }">
      <!-- LEFT: Character artwork -->
      <div class="hero-details__art">
        <div class="hero-details__aura" aria-hidden="true"></div>

        <img
          v-if="hero.image_plain || hero.image_with_card"
          :src="hero.image_plain || hero.image_with_card"
          :alt="hero.name"
        />
      </div>

      <!-- RIGHT: Hero information -->
      <div class="hero-details__body">
        <p class="hero-details__overline">CHAMPION OF ETERNITY</p>

        <div v-if="element" class="hero-details__element">
          {{ element }}
        </div>

        <h2 id="hero-details-title" class="hero-details__name">
          {{ hero.name }}
        </h2>

        <p v-if="hero.short_description" class="hero-details__subtitle">
          {{ hero.short_description }}
        </p>

        <!-- Hero Power -->
        <div v-if="hero.hero_power" class="hero-details__group">
          <h3>Hero power</h3>
          <p>{{ hero.hero_power }}</p>
        </div>

        <!-- Hero Story -->
        <div v-if="hero.description" class="hero-details__group">
          <h3>Story</h3>
          <p>{{ hero.description }}</p>
        </div>

        <!-- Hero Playstyle -->
        <div v-if="hero.playstyle" class="hero-details__group">
          <h3>Playstyle</h3>
          <p>{{ hero.playstyle }}</p>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  hero: {
    type: Object,
    default: null,
  },
  accent: {
    type: String,
    default: '#f77936',
  },
  element: {
    type: String,
    default: 'Champion',
  },
})

defineEmits(['close'])
</script>

<style lang="scss" scoped>
// Override existing BaseModal design
:global(.hero-details-modal) {
  border-color: #3b3635;
  background: #090d17;
}

:global(.hero-details-modal .base-modal__frame) {
  padding: 0;

  background: #090d17;
}

:global(.hero-details-modal .base-modal__decor) {
  display: none;
}

// Modal content
.hero-details {
  display: grid;
  grid-template-columns: 44% 56%;

  min-height: 520px;

  background:
    radial-gradient(
      circle at 20% 38%,
      color-mix(in srgb, var(--hero-accent) 12%, transparent),
      transparent 47%
    ),
    #090d17;

  // Character side
  &__art {
    position: relative;

    display: flex;
    overflow: hidden;
    align-items: flex-end;
    justify-content: center;

    min-height: 520px;
  }

  &__aura {
    position: absolute;
    top: 20%;
    left: 15%;

    width: 70%;
    aspect-ratio: 1;

    border: 4px solid var(--hero-accent);
    border-radius: 50%;
    box-shadow:
      0 0 45px var(--hero-accent),
      inset 0 0 45px var(--hero-accent);
    opacity: 0.36;
  }

  &__art img {
    position: relative;

    width: 100%;
    max-height: 580px;

    object-fit: contain;
    object-position: center bottom;
  }

  // Information side
  &__body {
    align-self: center;

    padding: 70px 52px 60px 26px;

    color: #beb9b5;
  }

  &__overline {
    margin: 0 0 24px;

    color: #5c5e66;
    font-family: var(--font-audiowide);
    font-size: 13px;
    letter-spacing: 0.06em;
  }

  &__element {
    margin-bottom: 12px;

    color: var(--hero-accent);
    font-size: 16px;
  }

  &__name {
    margin: 0;

    color: #fefeef;
    font-family: var(--font-audiowide);
    font-size: clamp(34px, 4vw, 64px);
    font-weight: 400;
    line-height: 1.3;

    overflow-wrap: anywhere;
  }

  &__subtitle {
    margin: 4px 0 32px;

    color: #fefeef;
    font-size: 21px;
  }

  &__group {
    margin-top: 25px;

    font-size: 15px;
    line-height: 1.65;
  }

  &__group h3 {
    margin: 0 0 8px;

    color: var(--hero-accent);
    font-family: var(--font-audiowide);
    font-size: 15px;
    font-weight: 400;
  }

  &__group p {
    margin: 0;

    white-space: pre-line;
  }

  // Mobile modal
  @media (max-width: 767px) {
    grid-template-columns: 1fr;

    &__art {
      min-height: 260px;
      max-height: 330px;
    }

    &__art img {
      max-height: 330px;
    }

    &__aura {
      top: 10%;
      left: 30%;

      width: 40%;
    }

    &__body {
      padding: 24px 22px 40px;
    }

    &__subtitle {
      margin-bottom: 20px;
    }
  }
}
</style>
