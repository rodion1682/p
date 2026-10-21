<template>
  <section class="champions" :style="{ '--champion-accent': activeAccent }">
    <div class="champions__layout _cnt-home">
      <!-- LEFT: Large hero artwork -->
      <div class="champions__stage">
        <button
          v-if="selectedHero"
          type="button"
          class="champions__portrait-button"
          :aria-label="`View ${selectedHero.name} details`"
          @click="openHeroDetails"
        >
          <span class="champions__glow" aria-hidden="true"></span>

          <span class="champions__sigil" aria-hidden="true">
            <span class="champions__sigil-icon">
              {{ getElementGlyph(selectedHero) }}
            </span>
          </span>

          <img
            v-if="selectedHero.image_plain"
            :key="selectedHero.id"
            class="champions__portrait"
            :src="selectedHero.image_plain"
            :alt="selectedHero.name"
          />
        </button>
      </div>

      <div class="champions__content">
        <h2 class="champions__headline">
          FIVE CHAMPIONS.<br />
          FIVE FORCES OF ETERNITY.
        </h2>

        <template v-if="selectedHero">
          <div class="champions__character">
            <!-- Element -->
            <div class="champions__element">
              <span class="champions__element-icon" aria-hidden="true">
                {{ getElementGlyph(selectedHero) }}
              </span>

              {{ getHeroClass(selectedHero) }}
            </div>
            <div class="champions__identity">
              <button
                type="button"
                class="champions__name"
                @click="openHeroDetails"
              >
                {{ selectedHero.name }}
              </button>

              <span
                v-if="selectedHero.short_description"
                class="champions__epithet"
              >
                {{ selectedHero.short_description }}
              </span>
            </div>

            <!-- Description -->
            <div class="champions__story">
              <p v-if="selectedHero.hero_power" class="champions__power">
                {{ selectedHero.hero_power }}
              </p>

              <p v-if="selectedHero.description" class="champions__description">
                {{ selectedHero.description }}
              </p>
            </div>

            <!-- Open hero modal -->
            <button
              type="button"
              class="champions__details-link"
              @click="openHeroDetails"
            >
              View hero details
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          <!-- Selectable hero cards -->
          <div class="champions__cards" aria-label="Choose a champion">
            <button
              v-for="(hero, index) in heroes"
              :key="hero.id"
              type="button"
              class="champions__card"
              :class="{
                'champions__card--selected': selectedHero.id === hero.id,
              }"
              :style="{
                '--card-accent': getAccent(hero, index),
              }"
              :aria-label="`Select ${hero.name}`"
              :aria-pressed="selectedHero.id === hero.id"
              @click="selectHero(index)"
            >
              <img
                v-if="hero.image_with_card || hero.image_plain"
                :src="hero.image_with_card || hero.image_plain"
                :alt="hero.name"
                loading="lazy"
              />

              <span v-else class="champions__card-fallback">
                {{ hero.name }}
              </span>
            </button>
          </div>
        </template>

        <!-- Loading -->
        <div
          v-else-if="heroesStore.isLoading"
          class="champions__status"
          role="status"
        >
          Loading heroes…
        </div>

        <!-- Empty/error state -->
        <div v-else class="champions__status" role="status">
          <p>Heroes are currently unavailable.</p>
          <button type="button" @click="loadHeroes">Try again</button>
        </div>
      </div>
    </div>

    <!-- Hero details popup -->
    <HeroDetailsModal
      :show="isDetailsOpen"
      :hero="selectedHero"
      :accent="activeAccent"
      :element="getHeroClass(selectedHero)"
      @close="isDetailsOpen = false"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import HeroDetailsModal from '@/components/modals/HeroDetailsModal.vue'
import { useHeroesStore } from '@/stores/heroes'

const fallbackAccents = [
  '#f77936', // Fire
  '#8fa9bf', // Ice
  '#3199f5', // Lightning
  '#b72f39', // Red
  '#a74bda', // Purple
]

const heroesStore = useHeroesStore()

// Get heroes from existing Pinia store
const heroes = computed(() => {
  const all = heroesStore.heroes || []

  // Show Zarek first, as in the reference image
  return [...all].sort((a, b) => Number(isZarek(b)) - Number(isZarek(a)))
})

const selectedIndex = ref(0)
const isDetailsOpen = ref(false)

// Currently selected hero
const selectedHero = computed(() => {
  return heroes.value[selectedIndex.value] || heroes.value[0] || null
})

// Detect Zarek
function isZarek(hero) {
  return /zarek/i.test(`${hero?.name || ''} ${hero?.slug || ''}`)
}

// Hero's theme color
function getAccent(hero, index = 0) {
  const color = hero?.image_hover_color

  if (typeof color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(color)) {
    return color
  }

  return fallbackAccents[index % fallbackAccents.length]
}

const activeAccent = computed(() => {
  return getAccent(selectedHero.value, selectedIndex.value)
})

// Frontend-only class fallback.
// The current heroes list API may omit class.
function getHeroClass(hero) {
  if (hero?.class) {
    return hero.class
  }

  if (isZarek(hero)) {
    return 'Fire'
  }

  return 'Champion'
}

// Small elemental icons
function getElementGlyph(hero) {
  const element = String(getHeroClass(hero)).toLowerCase()

  if (element.includes('fire')) return '♨'

  if (element.includes('ice') || element.includes('frost')) {
    return '❄'
  }

  if (element.includes('storm') || element.includes('lightning')) {
    return 'ϟ'
  }

  if (element.includes('shadow') || element.includes('void')) {
    return '◆'
  }

  return '✦'
}

// Change selected hero
function selectHero(index) {
  selectedIndex.value = index
}

// Open modal
function openHeroDetails() {
  if (selectedHero.value) {
    isDetailsOpen.value = true
  }
}

// Fetch from your existing API/store
async function loadHeroes() {
  try {
    await heroesStore.fetchHeroes()
  } catch (error) {
    console.error('Failed to load homepage heroes:', error)
  }
}

// Keep selected index valid
watch(heroes, () => {
  if (selectedIndex.value >= heroes.value.length) {
    selectedIndex.value = 0
  }
})

// Load heroes if not already loaded
onMounted(() => {
  if (!heroes.value.length) {
    loadHeroes()
  }
})
</script>

<style lang="scss" scoped>
.champions {
  position: relative;

  overflow: hidden;

  background: #090d17;

  &__layout {
    display: grid;
    align-items: stretch;
    gap: 10px;
    grid-template-columns:
      minmax(0, 47fr)
      minmax(0, 53fr);

    max-width: 1580px;
    min-height: 920px;
  }

  // LEFT HERO ARTWORK
  &__stage {
    position: relative;

    min-height: 850px;
  }

  &__portrait-button {
    position: absolute;
    inset: 0;

    width: 100%;

    border: 0;
    background: transparent;

    cursor: pointer;
  }

  &__glow {
    position: absolute;
    top: 19%;
    left: 50%;

    width: 70%;
    aspect-ratio: 1;

    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--champion-accent) 25%, transparent),
      transparent 68%
    );

    pointer-events: none;

    transform: translateX(-50%);

    filter: blur(30px);
  }

  &__sigil {
    position: absolute;
    top: 9%;
    left: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    width: min(47%, 280px);
    aspect-ratio: 1;

    border: 7px ridge var(--champion-accent);
    border-radius: 50%;
    background: radial-gradient(circle, #341b19 5%, #0b0f19 70%);
    box-shadow:
      0 0 30px color-mix(in srgb, var(--champion-accent) 38%, transparent),
      inset 0 0 25px var(--champion-accent);

    color: var(--champion-accent);

    pointer-events: none;
  }

  &__sigil-icon {
    font-size: clamp(85px, 10vw, 165px);
    line-height: 1;
    text-shadow: 0 0 18px var(--champion-accent);
  }

  &__portrait {
    position: absolute;
    inset: 0;

    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
    object-position: center bottom;

    filter: drop-shadow(0 12px 22px rgb(0 0 0 / 35%));
  }

  // RIGHT CONTENT
  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    min-width: 0;

    padding: 56px 4px 70px 0;
  }

  &__headline {
    margin: 0 0 70px;

    color: #55565e;
    font-family: var(--font-audiowide);
    font-size: clamp(22px, 2.05vw, 37px);
    font-weight: 400;
    line-height: 1.34;
    text-transform: uppercase;
  }

  &__character {
    width: 100%;
    max-width: 590px;
  }

  // ELEMENT LABEL
  &__element {
    display: flex;
    align-items: center;
    gap: 12px;

    margin-bottom: 24px;

    color: #aaa9ab;
    font-size: 22px;
  }

  &__element-icon {
    display: inline-flex;
    flex: 0 0 24px;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;

    border: 1px solid var(--champion-accent);
    border-radius: 50%;
    box-shadow: inset 0 0 7px var(--champion-accent);

    color: var(--champion-accent);
    font-size: 19px;
  }

  // HERO NAME
  &__identity {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    row-gap: 2px;
    column-gap: 30px;

    margin-bottom: 40px;
  }

  &__name {
    padding: 0;

    border: 0;
    background: none;

    color: #fefeef;
    font-family: var(--font-audiowide);
    font-size: clamp(42px, 3.8vw, 70px);
    line-height: 1.25;

    cursor: pointer;
  }

  &__epithet {
    color: #f1f0ed;
    font-size: 22px;
  }

  // HERO DESCRIPTION
  &__story {
    max-width: 535px;

    font-size: 13px;
    line-height: 1.32;
  }

  &__power {
    margin: 0 0 12px;

    color: #aba8a7;
    font-weight: 700;
  }

  &__description {
    margin: 0;

    color: #a4a1a1;
    white-space: pre-line;
  }

  &__details-link {
    margin-top: 22px;
    padding: 4px 0;

    border: 0;
    border-bottom: 1px solid var(--champion-accent);
    background: transparent;

    color: #ddd9d5;
    font-size: 13px;

    cursor: pointer;

    transition: color 0.2s ease;

    &:hover {
      color: var(--champion-accent);
    }

    &:focus-visible {
      outline: 2px solid var(--champion-accent);
      outline-offset: 4px;
    }
  }

  // HERO CARDS
  &__cards {
    display: flex;
    flex-wrap: nowrap;
    gap: clamp(8px, 1.2vw, 22px);

    width: 100%;

    margin-top: auto;
    padding-top: 50px;
  }

  &__card {
    display: flex;
    flex: 0 1 136px;
    align-items: center;
    justify-content: center;

    min-width: 0;
    height: 205px;

    padding: 12px;

    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    opacity: 0.66;

    cursor: pointer;

    transition:
      opacity 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;

    img {
      display: block;

      width: 100%;
      max-height: 165px;

      object-fit: contain;

      filter: drop-shadow(0 3px 5px rgb(0 0 0 / 35%));
    }

    &:hover,
    &:focus-visible {
      opacity: 1;

      transform: translateY(-4px);
    }

    &:focus-visible {
      outline: 2px solid var(--card-accent);
      outline-offset: 3px;
    }

    &--selected {
      border-color: var(--card-accent);
      background: rgb(14 17 29 / 85%);
      opacity: 1;

      transform: none;
    }
  }

  &__card-fallback {
    color: #e5e1df;
    font-size: 12px;
    text-align: center;

    overflow-wrap: anywhere;
  }

  &__status {
    margin-top: 30px;

    color: #aba8a7;
  }

  &__status button {
    margin-top: 10px;

    color: #fefeef;
    text-decoration: underline;
  }

  // TABLET
  @media (max-width: 1100px) {
    &__layout {
      grid-template-columns:
        minmax(0, 45fr)
        minmax(0, 55fr);

      min-height: 720px;
    }

    &__stage {
      min-height: 640px;
    }

    &__content {
      padding-top: 48px;
      padding-bottom: 38px;
    }

    &__headline {
      margin-bottom: 45px;
    }

    &__card {
      height: 155px;

      padding: 6px;
    }

    &__card img {
      max-height: 130px;
    }
  }

  // MOBILE
  @media (max-width: 767px) {
    &__layout {
      display: flex;
      flex-direction: column;

      min-height: 0;
    }

    &__stage {
      order: 1;

      min-height: 440px;
    }

    &__content {
      display: contents;
    }

    &__headline {
      order: 0;

      margin: 0 0 8px;
      padding: 48px 12px 0;

      font-size: clamp(20px, 5vw, 30px);
    }

    &__character {
      order: 2;

      max-width: none;

      padding: 20px 12px 5px;
    }

    &__element {
      margin-bottom: 15px;

      font-size: 18px;
    }

    &__identity {
      margin-bottom: 22px;
    }

    &__name {
      font-size: clamp(37px, 8vw, 56px);
    }

    &__epithet {
      font-size: 18px;
    }

    &__cards {
      overflow-x: auto;
      order: 3;
      gap: 5px;

      margin-top: 12px;
      padding: 20px 8px 40px;
    }

    &__card {
      flex: 0 0 100px;

      height: 143px;
    }

    &__card img {
      max-height: 122px;
    }

    &__status {
      order: 3;
    }

    &__sigil {
      width: 230px;
    }
  }

  @media (max-width: 420px) {
    &__stage {
      min-height: 360px;
    }

    &__sigil {
      width: 190px;
    }

    &__card {
      flex-basis: 87px;

      height: 130px;
    }

    &__card img {
      max-height: 116px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .champions__card,
  .champions__details-link {
    transition: none;
  }
}
</style>
