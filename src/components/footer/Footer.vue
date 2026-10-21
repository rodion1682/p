<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <div class="footer__top">
        <div class="footer__info">
          <div class="footer__for-logo"></div>
          <div
            data-da-id="footer-links-first"
            data-da=".footer__for-links,991.98,first"
            class="footer__links footer__links_first"
          >
            <RouterLink :to="{ name: 'ProductListPage' }" class="footer__link">
              {{ $t('Сard Store') }}
            </RouterLink>
            <RouterLink to="/about" class="footer__link">
              {{ $t('About Game') }}
            </RouterLink>
            <RouterLink :to="{ name: 'FaqPage' }" class="footer__link">
              {{ $t('FAQ') }}
            </RouterLink>
          </div>
          <div
            v-html="settingsStore.settings?.requisites"
            class="footer__requisites"
          />
          <div
            data-da-id="footer-copy"
            data-da=".footer__for-copy,991.98,first"
            v-html="settingsStore.settings?.copyright"
            class="footer__copy"
          />
          <div class="footer__for-links"></div>
        </div>
        <RouterLink
          data-da-id="footer-logo"
          data-da=".footer__for-logo,991.98,first"
          :to="{ name: 'HomePage' }"
          class="footer__logo _ibg-contain"
        >
          <img src="@/assets/img/icons/logo-deck.png" />
        </RouterLink>
        <div class="footer__about">
          <div v-if="settingsStore.supportEmail" class="footer__box">
            <div class="footer__box-label">{{ $t('Contacts') }}:</div>
            <a
              :href="`mailto:${settingsStore.supportEmail}`"
              class="footer__email _link"
            >
              {{ settingsStore.supportEmail }}
            </a>
          </div>
          <div v-if="staticStore.socialLinks.length" class="footer__socials">
            <a
              v-for="link in staticStore.socialLinks"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__social _ibg-contain"
            >
              <img :src="link.image" />
            </a>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="footer__for-copy"></div>
        <div class="footer__methods">
          <div
            class="footer__method _ibg-contain"
            v-for="(item, i) in settingsStore.settings?.footer_images"
            :key="i"
            :style="{ height: `${item.height}px` }"
          >
            <img :src="item.url" :alt="item.url" />
          </div>
        </div>
        <div
          data-da-id="footer-links-last"
          data-da=".footer__for-links,991.98,last"
          class="footer__links footer__links_last"
        >
          <RouterLink
            v-for="page in staticStore.pages"
            :key="page.id"
            :to="page.slug ? `/${page.slug}` : `/static-page/${page.id}`"
            class="footer__link"
          >
            {{ page.title }}
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'
import { nextTick, onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'SiteFooter',
})

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()

const refreshDynamicAdapt = async () => {
  await nextTick()
  initDynamicAdapt('max')
}

onMounted(async () => {
  await refreshDynamicAdapt()

  if (staticStore.pages.length === 0) {
    await staticStore.fetchPages()
  }
  if (!settingsStore.settings) {
    await settingsStore.fetchSettings()
  }
  if (!staticStore.socialLinks || staticStore.socialLinks.length === 0) {
    await staticStore.fetchSocialLinks()
  }
})

onBeforeUnmount(() => {
  destroyDynamicAdapt()
})
</script>

<style lang="scss" scoped>
.footer {
  @include adaptiveValue('padding-top', 64, 30);
  @include adaptiveValue('padding-bottom', 20, 30);
  position: relative;
  z-index: 3;

  border-top: 1px solid var(--border-priamry-color);
  background-color: var(--bg-primary-color);
  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 18);
    }
    @media (min-width: $md5) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 30px;
      }
    }
  }

  &__info {
    max-width: 554px;
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__for-logo {
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    @media (max-width: $md3) {
      @include adaptiveValue('margin-left', -16, -10);
    }
    @media (max-width: $md5) {
      @include adaptiveValue('margin-left', -16, -10);
    }
    &_first {
      @media (min-width: $md3) {
        @include adaptiveValue('margin-left', -16, -10);
        &:not(:last-child) {
          @include adaptiveValue('margin-bottom', 39, 8);
        }
      }
    }

    &_last {
      @media (min-width: $md3) {
        @include adaptiveValue('margin-right', -16, -10);
      }
    }
  }

  &__link {
    @include adaptiveValue('padding-left', 16, 10);
    @include adaptiveValue('padding-right', 16, 10);
    padding-top: 10px;
    padding-bottom: 10px;

    color: var(--fourth-color);
    font-size: 14px;
    font-weight: 600;
    line-height: 150%;
    &.router-link-active {
      color: var(--hint-primary-color);

      pointer-events: none;
    }
  }

  &__requisites,
  &__copy {
    color: var(--fifth-color);
    font-size: 14px;
    font-weight: 700;
    line-height: 150%;
  }
  &__requisites {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__copy {
    color: var(--seventh-color);
  }

  &__for-links {
  }

  &__logo {
    display: block;

    width: 100%;
    max-width: 379px;
    aspect-ratio: 1 / 0.55;
    @media (max-width: $md3) {
      @include adaptiveValue('max-width', 220, 120);
    }
    @media (max-width: $md5) {
      margin-right: auto;
      margin-left: auto;
    }
  }

  &__about {
    width: 100%;
    max-width: 554px;
    @media (max-width: $md3) {
      display: flex;
      flex-direction: column;
    }
  }

  &__box {
    @include adaptiveValue('gap', 30, 10);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 57, 18);
    }
    &-label {
      color: var(--fifth-color);
      font-family: var(--font-inter);
      font-weight: 500;
      line-height: 150%;
    }
  }

  &__email {
  }

  &__socials {
    @include adaptiveValue('gap', 24, 12);
    display: flex;
    justify-content: flex-end;
  }

  &__social {
    @include adaptiveValue('min-width', 32, 40);
    @include adaptiveValue('height', 32, 40);
    width: fit-content;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    @media (max-width: $md7) {
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }
  }

  &__for-copy {
    @media (min-width: $md3) {
      @include hide-item;
    }
  }
  &__methods {
    display: flex;
    flex-wrap: wrap;
  }

  &__method {
    width: fit-content;
    min-width: 66px;
  }
}
</style>
