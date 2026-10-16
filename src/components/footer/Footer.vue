<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <div class="footer__info">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="footer__logo _ibg-contain"
        >
          <img src="@/assets/img/icons/logo-deck.svg" />
        </RouterLink>
        <div v-html="settingsStore.settings?.copyright" class="footer__copy" />
        <div
          v-html="settingsStore.settings?.requisites"
          class="footer__requisites"
        />
        <div v-if="settingsStore.supportEmail" class="footer__box">
          <div class="footer__box-label">
            {{ $t('Contacts:') }}
          </div>
          <a
            :href="`mailto:${settingsStore.supportEmail || 'support@domain.com'}`"
            class="footer__email"
          >
            {{ settingsStore.supportEmail }}
          </a>
        </div>
      </div>

      <div class="footer__links footer__links_first">
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
      <div class="footer__links footer__links_last">
        <RouterLink
          v-for="page in staticStore.pages"
          :key="page.id"
          :to="page.slug ? `/${page.slug}` : `/static-page/${page.id}`"
          class="footer__link"
        >
          {{ page.title }}
        </RouterLink>
      </div>
      <div class="footer__about">
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
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'SiteFooter',
})

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
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
</script>

<style lang="scss" scoped>
.footer {
  @include adaptiveValue('padding-top', 46, 30);
  @include adaptiveValue('padding-bottom', 46, 30);
  position: relative;
  z-index: 1;

  background-color: var(--bg-seventh-color);
  &__inner {
    @include adaptiveValue('gap', 149, 20, 1870, 1370, 1);
    display: flex;
    @media (max-width: 1099.98px) {
      flex-wrap: wrap;
      gap: 20px;
    }
  }

  &__info {
    @media (min-width: 1099.98px) {
      max-width: 560px;
    }
    @media (max-width: 1099.98px) {
      flex: 0 1 calc(50% - 10px);
      order: 1;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__logo {
    display: block;

    width: fit-content;
    min-width: 209px;
    height: 43px;
    &:not(:last-child) {
      margin-bottom: 13px;
    }
  }

  &__copy,
  &__requisites,
  &__box-label,
  &__email {
    color: var(--seventh-color);
    font-size: 14px;
    line-height: 150%;
    letter-spacing: 0px;
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__requisites {
  }

  &__box {
    display: flex;
    align-items: center;
    gap: 6px;
    &-label {
      &:not(:last-child) {
        margin-bottom: 0px;
      }
    }
  }

  &__email {
    color: var(--primary-color);

    transition: color 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        color: var(--secondary-color);
      }
    }
  }

  &__links {
    display: flex;
    flex-direction: column;
    @media (max-width: 1099.98px) {
      flex: 0 1 calc(50% - 10px);
      order: 3;
    }
  }

  &__link {
    @include adaptiveValue('padding-bottom', 11, 10);
    @include adaptiveValue('padding-top', 11, 10);
    position: relative;

    width: fit-content;

    padding-left: 14px;

    color: var(--primary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 150%;
    letter-spacing: 0px;

    transition: color 0.3s ease 0s;
    &.router-link-active {
      color: var(--third-color);

      pointer-events: none;
    }
    &::before {
      position: absolute;
      top: 50%;
      left: 0;

      width: 6px;
      height: 6px;

      border-radius: 50%;
      background-color: var(--fifth-color);

      content: '';

      transform: translate(0px, -50%);
      transition: background-color 0.3s ease 0s;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--third-color);
      }
    }
  }

  &__about {
    margin-left: auto;
    @media (max-width: 1099.98px) {
      flex: 0 1 calc(50% - 10px);
      order: 2;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
      order: 4;
    }
  }

  &__socials {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 53, 18);
    }
  }

  &__social {
    @include adaptiveValue('min-width', 46, 36);
    width: fit-content;
    aspect-ratio: 1 / 1;

    transition: transform 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        transform: scale(1.03);
      }
    }
  }

  &__methods {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  &__method {
    width: fit-content;
    min-width: 66px;
  }
}
</style>
