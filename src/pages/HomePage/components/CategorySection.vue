<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import axios from '@/plugins/axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cs2Types = ref([])
const filtersLoading = ref(false)
const filtersError = ref(false)

const fetchCS2Filters = async () => {
  if (cs2Types.value.length || filtersLoading.value) return

  filtersLoading.value = true
  filtersError.value = false

  try {
    const { data } = await axios.get('/items/filter-data', {
      params: { category: 'cs2' },
    })

    if (data?.status !== 'OK') {
      throw new Error('Failed to fetch CS2 filters')
    }

    cs2Types.value = Array.isArray(data.payload?.types)
      ? data.payload.types
          .map(type => String(type).trim().toLowerCase())
          .filter(Boolean)
      : []
  } catch (error) {
    console.error('Failed to load CS2 filters:', error)
    filtersError.value = true
  } finally {
    filtersLoading.value = false
  }
}

const getAvailableTypes = requestedTypes => {
  return requestedTypes.filter(type =>
    cs2Types.value.includes(type.toLowerCase()),
  )
}

const weaponTypes = computed(() =>
  getAvailableTypes([
    'rifle',
    'pistol',
    'sniper rifle',
    'smg',
    'machinegun',
    'shotgun',
  ]),
)

const knivesAndGlovesTypes = computed(() =>
  getAvailableTypes(['knife', 'gloves']),
)

const rareItemTypes = computed(() =>
  getAvailableTypes(['sticker', 'music kit', 'collectible']),
)

const goToCS2Category = async requestedTypes => {
  if (!cs2Types.value.length) {
    await fetchCS2Filters()
  }

  const types = getAvailableTypes(requestedTypes)

  if (!types.length) {
    if (filtersError.value) {
      console.warn('CS2 filter data could not be loaded')
    }

    return
  }

  await router.push({
    name: 'ProductListPage',
    query: {
      category: 'cs2',
      type: types
        .map(type => type.replace(/\b\w/g, char => char.toUpperCase()))
        .join(','),
    },
  })
}

const goToCS2 = () => {
  return goToCS2Category(weaponTypes.value)
}

const goToKnivesAndGloves = () => {
  return goToCS2Category(['knife', 'gloves'])
}

const goToDota2 = () => {
  return router.push({
    name: 'ProductListPage',
    query: {
      category: 'dota2',
    },
  })
}

const goToRareItems = () => {
  return goToCS2Category(['sticker', 'music kit', 'collectible'])
}

onMounted(() => {
  fetchCS2Filters()
})
</script>

<template>
  <section class="cat">
    <div class="cat__inner _cnt">
      <div class="cat__top">
        <div class="cat__label">
          {{ $t('FEATURED CATEGORIES') }}
        </div>

        <div class="cat__title _h2">
          {{ $t('FIND YOUR') }}
          <span>{{ $t('NEXT FAVORITE') }}</span>
        </div>

        <div class="cat__text">
          {{
            $t(
              'Explore a wide selection of cosmetics and discover items that match your style.',
            )
          }}
        </div>
      </div>
      <div class="cat__items">
        <div class="cat__item">
          <div class="cat__content">
            <div class="cat__number">01</div>

            <div class="cat__subtitle _h3">
              <div>{{ $t('CS2') }}</div>
              <span>{{ $t('Weapon Skins') }}</span>
            </div>

            <div class="cat__info">
              {{
                $t(
                  'Give your loadout a new look with weapon finishes ranging from clean, minimalist designs to bold and colorful patterns.',
                )
              }}
            </div>

            <BaseButton
              class="cat__button"
              variant="white-bordered"
              :disabled="filtersLoading"
              @click="goToCS2"
            >
              {{ $t('Browse CS2 Skins') }}
            </BaseButton>
          </div>

          <div class="cat__image _ibg-contain">
            <img src="@/assets/img/cat-01.png" alt="CS2 Weapon Skins" />
          </div>
        </div>

        <div class="cat__item">
          <div class="cat__content">
            <div class="cat__number">02</div>

            <div class="cat__subtitle _h3">
              <div>{{ $t('Knives &') }}</div>
              <span>{{ $t('Gloves') }}</span>
            </div>

            <div class="cat__info">
              {{
                $t(
                  'Discover distinctive knives and gloves that bring character to your inventory and help you stand out in every match.',
                )
              }}
            </div>

            <BaseButton
              class="cat__button"
              variant="white-bordered"
              :disabled="filtersLoading"
              @click="goToKnivesAndGloves"
            >
              {{ $t('Explore Knives & Gloves') }}
            </BaseButton>
          </div>

          <div class="cat__image _ibg-contain">
            <img src="@/assets/img/cat-02.png" alt="CS2 Knives and Gloves" />
          </div>
        </div>

        <div class="cat__item">
          <div class="cat__content">
            <div class="cat__number">03</div>

            <div class="cat__subtitle _h3">
              <div>{{ $t('Dota 2') }}</div>
              <span>{{ $t('Cosmetics') }}</span>
            </div>

            <div class="cat__info">
              {{
                $t(
                  'Customize your favorite heroes with unique equipment, character sets, and cosmetic items inspired by the world of Dota 2.',
                )
              }}
            </div>

            <BaseButton
              class="cat__button"
              variant="white-bordered"
              @click="goToDota2"
            >
              {{ $t('Browse Dota 2 Skins') }}
            </BaseButton>
          </div>

          <div class="cat__image _ibg-contain">
            <img src="@/assets/img/cat-03.png" alt="Dota 2 Cosmetics" />
          </div>
        </div>

        <div class="cat__item">
          <div class="cat__content">
            <div class="cat__number">04</div>

            <div class="cat__subtitle _h3">
              <div>{{ $t('Rare &') }}</div>
              <span>{{ $t('Collectible Items') }}</span>
            </div>

            <div class="cat__info">
              {{
                $t(
                  'Find distinctive designs and collectible cosmetics for players who appreciate unique appearances and memorable in-game items.',
                )
              }}
            </div>

            <BaseButton
              class="cat__button"
              variant="white-bordered"
              :disabled="filtersLoading"
              @click="goToRareItems"
            >
              {{ $t('Discover Items') }}
            </BaseButton>
          </div>

          <div class="cat__image _ibg-contain">
            <img
              src="@/assets/img/cat-04.png"
              alt="Rare and Collectible Items"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cat {
  position: relative;
  z-index: 1;
  @include adaptiveValue('margin-top', -50, 0);
  &__inner {
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 20);
    }
  }

  &__label {
    text-transform: uppercase;
    color: var(--fifth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
    @media (max-width: $md6) {
      span {
        display: block;
      }
    }
  }

  &__text {
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    @include adaptiveValue('gap', 20, 10);
    @media (max-width: $md3) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    @include adaptiveValue('padding-top', 30, 10);
    @include adaptiveValue('padding-left', 50, 10);
    @include adaptiveValue('padding-right', 50, 10);
    @include adaptiveValue('padding-bottom', 30, 10);
    @include adaptiveValue('border-radius', 18, 8);
    border: 1px solid transparent;
    background:
      linear-gradient(#030b17, #030b17) padding-box,
      linear-gradient(
          0deg,
          #030b17 10%,
          rgb(26, 115, 255, 0.7) 50%,
          #030b17 90%
        )
        border-box;
    box-shadow: inset -200px 0 60px 20px rgba(26, 115, 255, 0.05);
    overflow: hidden;
  }

  &__content {
    max-width: 295px;
    position: relative;
    z-index: 1;
    text-align: left;
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }

  &__number {
    line-height: 100%;
    font-weight: 900;
    font-family: var(--font-orbitron);
    color: var(--border-primary-color);
    position: relative;
    width: fit-content;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 23, 18);
    }
    &::after {
      content: '';
      position: absolute;
      @include adaptiveValue('right', -20, -10);
      top: 50%;
      transform: translate(100%, -50%);
      width: 180px;
      height: 1px;
      background-image: url('@/assets/img/number-line.svg');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__info {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 23, 18);
    }
  }

  &__button {
    margin-top: auto;
  }

  &__image {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(0px, -50%);
    width: 45%;
    aspect-ratio: 1 / 0.95;
    @media (max-width: $md2) {
      opacity: 0.75;
    }
  }
}
</style>
