<template>
  <div class="heros">
    <div class="heros__inner _cnt-home">
      <button
        v-if="selectedHero"
        type="button"
        class="heros__iamge _ibg-contain"
        @click="openHeroDetails"
      >
        <img
          v-if="selectedHero.image_plain"
          :key="selectedHero.id"
          :src="selectedHero.image_plain"
          :alt="selectedHero.name"
        />
      </button>

      <div class="heros__content">
        <template v-if="selectedHero">
          <div class="heros__title _h4">
            <div>{{ $t('FIVE CHAMPIONS.') }}</div>
            <div>{{ $t('FIVE FORCES OF ETERNITY.') }}</div>
          </div>
          <div class="heros__style">
            <div class="heros__style-icon _ibg-contain">
              <img
                v-if="getElementIcon(selectedHero)"
                :src="getElementIcon(selectedHero)"
              />
            </div>
            <div class="heros__style-label">
              {{ selectedHero.name }}
            </div>
          </div>
          <button type="button" class="heros__name" @click="openHeroDetails">
            <div class="heros__name-large _h3">
              {{ selectedHero.name }}
            </div>
            <div class="heros__name-small">{{ selectedHero.hero_power }}</div>
          </button>
          <div v-if="selectedHero.playstyle" class="heros__playstyle">
            {{ selectedHero.playstyle }}
          </div>
          <div v-if="selectedHero.short_description" class="heros__desc">
            {{ selectedHero.short_description }}
          </div>

          <div class="heros__cards">
            <button
              v-for="(hero, index) in heroes"
              :key="hero.id"
              type="button"
              class="heros__card"
              :class="{
                heros__card_selected: selectedHero.id === hero.id,
              }"
              @click="selectHero(index)"
            >
              <div class="heros__card-iamge _ibg-contain">
                <img
                  v-if="hero.image_plain"
                  :src="hero.image_plain"
                  :alt="hero.name"
                  loading="lazy"
                />
              </div>
            </button>
          </div>
        </template>
        <LoadingSpinner
          v-else-if="heroesStore.isLoading"
          class="heros__loading"
        />
        <div v-else class="heros__empty _h4">
          {{ $t('Heroes are currently unavailable.') }}
        </div>
      </div>
    </div>

    <HeroDetailsModal
      :show="isDetailsOpen"
      :hero="selectedHero"
      :heroes="heroes"
      :accent="activeAccent"
      :element="getElementName(selectedHero)"
      :element-icon="getElementIcon(selectedHero)"
      @select-hero="selectHeroById"
      @close="isDetailsOpen = false"
    />
  </div>
</template>

<script setup>
import HeroDetailsModal from '@/components/modals/HeroDetailsModal.vue'
import { useHeroesStore } from '@/stores/heroes'
import { computed, onMounted, ref, watch } from 'vue'

import fireIcon from '@/assets/img/fire.png'
import iceIcon from '@/assets/img/ice.png'
import lightningIcon from '@/assets/img/lightning.png'
import purpleIcon from '@/assets/img/purple.png'
import redIcon from '@/assets/img/red.png'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'

const heroElements = {
  1: {
    name: 'Fire',
    icon: fireIcon,
    color: '#f77936',
  },
  2: {
    name: 'Ice',
    icon: iceIcon,
    color: '#8fa9bf',
  },
  3: {
    name: 'Lightning',
    icon: lightningIcon,
    color: '#3199f5',
  },
  4: {
    name: 'Red',
    icon: redIcon,
    color: '#b72f39',
  },
  5: {
    name: 'Purple',
    icon: purpleIcon,
    color: '#a74bda',
  },
}

const heroesStore = useHeroesStore()

const heroes = computed(() => {
  return [...(heroesStore.heroes || [])].sort(
    (a, b) => Number(a.id) - Number(b.id),
  )
})

const selectedIndex = ref(0)
const isDetailsOpen = ref(false)

const selectedHero = computed(() => {
  return heroes.value[selectedIndex.value] || null
})

function getHeroElement(hero) {
  if (!hero) return null

  return heroElements[Number(hero.id)] || null
}

function getElementName(hero) {
  return getHeroElement(hero)?.name || hero?.class || 'Champion'
}

function getElementIcon(hero) {
  return getHeroElement(hero)?.icon || null
}

function getAccent(hero) {
  const color = hero?.image_hover_color

  if (typeof color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(color)) {
    return color
  }

  return getHeroElement(hero)?.color || '#f77936'
}

const activeAccent = computed(() => {
  return getAccent(selectedHero.value)
})

function selectHero(index) {
  selectedIndex.value = index
}

function selectHeroById(heroId) {
  const index = heroes.value.findIndex(
    hero => Number(hero.id) === Number(heroId),
  )

  if (index !== -1) {
    selectedIndex.value = index
  }
}

function openHeroDetails() {
  if (selectedHero.value) {
    isDetailsOpen.value = true
  }
}

async function loadHeroes() {
  try {
    await heroesStore.fetchHeroes()
  } catch (error) {
    console.error('Failed to load heroes:', error)
  }
}

watch(heroes, () => {
  if (selectedIndex.value >= heroes.value.length) {
    selectedIndex.value = 0
  }
})

onMounted(() => {
  if (!heroes.value.length) {
    loadHeroes()
  }
})
</script>

<style lang="scss" scoped>
.heros {
  @include adaptiveValue('padding-top', 64, 30);
  @include adaptiveValue('padding-bottom', 83, 30);
  &__inner {
    @include adaptiveValue('gap', 130, 20, 1370, 992, 1);
    display: flex;

    max-width: 1370px;
    @media (max-width: $md3) {
      flex-direction: column-reverse;
    }
    @media (max-width: $md3) {
      gap: 10px;
    }
  }

  &__iamge {
    flex: 0 1 41%;

    aspect-ratio: 1 / 1.62;
    @media (max-width: $md3) {
      width: 100%;
      max-width: 491px;

      margin: 0 auto;
    }
  }

  &__content {
    display: flex;
    flex: 0 1 59%;
    flex-direction: column;
  }

  &__title {
    @include adaptiveValue('font-size', 42, 19);
    color: var(--sixth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 84, 18);
    }
  }

  &__style {
    display: flex;
    align-items: center;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
    &-icon {
      min-width: 29px;
      height: 29px;
    }

    &-label {
      @include adaptiveValue('font-size', 24, 20);
      @include adaptiveValue('line-height', 33, 38);
      color: var(---fifth-color);
    }
  }

  &__name {
    font-weight: 400;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 18);
    }
    @media (min-width: $md6) {
      @include adaptiveValue('gap', 46, 20, 1370, 992, 1);
      display: flex;
    }
    @media (max-width: $md6) {
      text-align: left;
    }
    &-large {
      color: var(--third-color);
      @media (min-width: $md6) {
        line-height: 100%;
      }
    }

    &-small {
      @include adaptiveValue('font-size', 24, 20);
      @include adaptiveValue('line-height', 33, 38);
      align-self: flex-end;

      color: var(--third-color);
    }
  }

  &__playstyle {
    color: var(--fifth-color);
    font-weight: 700;
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__desc {
    color: var(--fifth-color);
  }

  &__cards {
    @include adaptiveValue('margin-top', 124, 22);
    display: flex;
    flex-wrap: wrap;
    @media (max-width: $md6) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  &__card {
    @include adaptiveValue('padding-left', 17, 10);
    @include adaptiveValue('padding-right', 17, 10);
    @include adaptiveValue('padding-top', 20, 10);
    @include adaptiveValue('padding-bottom', 20, 10);
    flex: 0 1 20%;

    border: 1px solid transparent;
    border-radius: 10px;
    opacity: 0.5;

    transition: all 0.3s ease 0s;
    &_selected {
      border-color: var(--hint-fifth-color);
      opacity: 1;

      pointer-events: none;
    }

    &-iamge {
      width: 100%;
      aspect-ratio: 1 / 1.5;
    }
    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-fifth-color);
        opacity: 1;
      }
    }
    @media (max-width: $md6) {
      flex: 0 1 33.333%;
    }
  }

  &__loading {
    margin: auto;
  }

  &__empty {
    margin: auto;

    color: var(--fifth-color);
    text-align: center;
  }
}
</style>
