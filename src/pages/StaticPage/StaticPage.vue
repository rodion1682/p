<template>
  <main class="static">
    <div class="static__background _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="static__inner _cnt-home">
      <div class="static__decoration" aria-hidden="true">
        <img src="@/assets/img/product-list-decor.png" alt="" />
      </div>

      <LoadingSpinner v-if="loading" class="static__loader" />

      <div v-else-if="error" class="static__error _text-error">
        {{ error }}
      </div>

      <div v-else-if="currentPage" class="static__page">
        <h1 class="static__title _h3">
          {{ currentPage.title }}
        </h1>

        <div class="static__content" v-html="filteredContent" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const isDebugContentActive = false

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()

defineProps({
  id: String,
  slug: String,
})

const debugTitle = 'Static Page - Design System Preview'

const debugContent = `
  <h1>Heading H1 - Main Page Heading</h1>
  <p>
    This is the first paragraph of the page. It demonstrates the
    introductory paragraph styling, spacing, and text colors.
  </p>

  <h2>Heading H2 - Section Title</h2>
  <p>
    This is a standard paragraph with
    <strong>strong highlighted text</strong>,
    <b>bold text</b>,
    <em>italic text</em>,
    and an <a href="#debug-links">example internal link</a>.
  </p>

  <h3>Heading H3 - Subsection</h3>
  <p>
    Here is a paragraph containing
    <span style="color: red; background: yellow; font-size: 28px;">
      an inline styled span that should inherit the website theme
    </span>.
    It tests whether your important CSS overrides are working.
  </p>

  <h4>Heading H4 - Small Heading</h4>
  <p>
    This section demonstrates the smallest heading level
    and how it looks next to regular body text.
  </p>

  <h2>Paragraphs and Text Formatting</h2>

  <p>
    This paragraph demonstrates normal text rendering and line height.
    Celestia Card is a fantasy card marketplace where players can
    collect, trade, and manage unique cards.
  </p>

  <p>
    This is a second paragraph to test vertical spacing between
    multiple paragraphs and how they wrap on smaller screens.
  </p>

  <p style="color: red; font-size: 30px; background: white;">
    This paragraph has inline styles that should be overridden
    by your existing CMS styling rules.
  </p>

  <p>
    <strong>Strong text example</strong>,
    <b>bold text example</b>,
    <em>emphasized text example</em>,
    and <span>regular span text</span>.
  </p>

  <div class="br-space"></div>

  <h2 id="debug-links">Links</h2>

  <p>
    This is an
    <a href="#debug-table">internal anchor link</a>
    and this is an
    <a href="https://example.com" target="_blank" rel="noopener noreferrer">
      external example link
    </a>.
  </p>

  <p>
    <a href="#debug-code">
      <span>Link containing a nested span</span>
    </a>
  </p>

  <h2>Unordered List</h2>

  <ul>
    <li>First item - Collect unique fantasy cards</li>
    <li>Second item - Explore different rarities</li>
    <li>Third item - Build your collection</li>
    <li>
      Fourth item - Longer text to test how list items
      wrap naturally on smaller screen resolutions.
    </li>
  </ul>

  <h2>Ordered List</h2>

  <ol>
    <li>Create your account</li>
    <li>Browse available card packs</li>
    <li>Choose your favorite cards</li>
    <li>Complete your purchase</li>
    <li>View your collection</li>
  </ol>

  <h2>Blockquotes</h2>

  <blockquote>
    Every legendary collection begins with a single card.
    Explore the world of Celestia and discover your destiny.
  </blockquote>

  <blockquote>
    <p>
      This is a longer blockquote containing a paragraph.
      It tests the border, background, padding, font style,
      and text wrapping on mobile devices.
    </p>
  </blockquote>

  <h2 id="debug-code">Inline Code</h2>

  <p>
    Use <code>const card = ref(null)</code> to create a
    reactive Vue reference.
  </p>

  <p>
    Another example:
    <code>npm run dev</code>
    starts the development server.
  </p>

  <h2>Code Block</h2>

  <pre><code>import { computed, ref } from 'vue'

const quantity = ref(1)
const price = ref(25)

const total = computed(() => {
  return quantity.value * price.value
})

console.log(total.value)</code></pre>

  <h2 id="debug-table">Standard Table</h2>

  <div class="table-scroll-wrapper">
    <table>
      <thead>
        <tr>
          <th>Card Name</th>
          <th>Rarity</th>
          <th>Type</th>
          <th>Price</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Celestial Guardian</td>
          <td>Legendary</td>
          <td>Hero</td>
          <td>$120.00</td>
          <td>Available</td>
        </tr>
        <tr>
          <td>Moonlight Sorcerer</td>
          <td>Epic</td>
          <td>Mage</td>
          <td>$75.00</td>
          <td>Sold</td>
        </tr>
        <tr>
          <td>Forest Protector</td>
          <td>Rare</td>
          <td>Warrior</td>
          <td>$35.00</td>
          <td>Available</td>
        </tr>
        <tr>
          <td>Ancient Dragon</td>
          <td>Legendary</td>
          <td>Creature</td>
          <td>$250.00</td>
          <td>Available</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Wide Table - Mobile Overflow Test</h2>

  <div class="table-scroll-wrapper">
    <table>
      <thead>
        <tr>
          <th>Card ID</th>
          <th>Card Name</th>
          <th>Collection</th>
          <th>Rarity</th>
          <th>Element</th>
          <th>Attack</th>
          <th>Health</th>
          <th>Mana</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>#10001</td>
          <td>Celestial Guardian</td>
          <td>Genesis Collection</td>
          <td>Legendary</td>
          <td>Light</td>
          <td>8</td>
          <td>10</td>
          <td>7</td>
          <td>$120.00</td>
        </tr>
        <tr>
          <td>#10002</td>
          <td>Shadow Hunter</td>
          <td>Eclipse Collection</td>
          <td>Epic</td>
          <td>Dark</td>
          <td>7</td>
          <td>6</td>
          <td>5</td>
          <td>$85.00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Mixed Content</h2>

  <p>
    This section combines
    <strong>bold text</strong>,
    <em>italic text</em>,
    <a href="#debug-table">links</a>,
    and <code>inline code</code>
    inside the same paragraph.
  </p>

  <ul>
    <li>
      <strong>Legendary:</strong>
      The rarest cards with powerful abilities.
    </li>
    <li>
      <strong>Epic:</strong>
      Strong cards with unique effects.
    </li>
    <li>
      <strong>Rare:</strong>
      Valuable cards for your collection.
    </li>
  </ul>

  <blockquote>
    <p>
      <strong>Important:</strong>
      This is a mixed-format blockquote with
      <em>italic text</em> and
      <a href="#debug-links">a link</a>.
    </p>
  </blockquote>

  <h2>Long Text - Responsive Test</h2>

  <p>
    This longer section is intended to test readability and
    responsiveness across desktop, tablet, and mobile screens.
    The layout should maintain consistent line height, proper
    spacing, and readable text colors without introducing
    unwanted horizontal scrolling.
  </p>

  <p>
    All headings, paragraphs, links, lists, tables, and code
    blocks should visually belong to the same Celestia Card
    design system.
  </p>
`

const loading = computed(() => !isDebugContentActive && staticStore.loading)

const error = computed(() => (isDebugContentActive ? null : staticStore.error))

const currentPage = computed(() => {
  if (isDebugContentActive) {
    return {
      title: debugTitle,
      content: debugContent,
    }
  }

  return staticStore.currentPage
})

const fetchPage = async () => {
  if (isDebugContentActive) {
    return
  }

  const identifier = route.params.slug || route.params.id

  if (!identifier) {
    router.push({ name: 'NotFound' })
    return
  }

  try {
    await staticStore.fetchPageById(identifier)

    if (!staticStore.currentPage) {
      router.push({ name: 'NotFound' })
    }
  } catch (err) {
    router.push({ name: 'NotFound' })
    console.error('Error fetching page:', err)
  }
}

const filteredContent = computed(() => {
  const content = currentPage.value?.content

  if (!content) {
    return ''
  }

  return content.replace(
    /(?:(?:&amp;)?&nbsp;|&nbsp;|&#160;|&#x0*a0;|\u00a0)+/gi,
    ' ',
  )
})

onMounted(() => {
  fetchPage()
})

watch(
  () => route.params.slug || route.params.id,
  () => fetchPage(),
)
</script>

<style lang="scss" scoped>
.static {
  @include adaptiveValue('padding-top', 78, 60);
  @include adaptiveValue('padding-bottom', 70, 35);

  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 550px;

  background-color: var(--bg-primary-color);

  &__background {
    position: absolute;
    inset: 0;
    z-index: 0;

    width: 100%;
    height: 100%;
    max-height: 915px;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;

    margin: 0 auto;
  }

  &__decoration {
    position: relative;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    width: 100%;
    height: 32px;

    margin-bottom: 24px;

    border-bottom: 1px solid var(--border-priamry-color);

    img {
      position: absolute;
      bottom: 0;
      left: 50%;

      display: block;

      width: min(250px, 55vw);
      max-height: 50px;

      object-fit: contain;
      object-position: center bottom;

      transform: translateX(-50%);
    }
  }

  &__loader {
    display: flex;

    margin: auto;
  }

  &__error {
    margin: auto;

    color: var(--error-color);
    text-align: center;
  }

  &__page {
    width: 100%;
    max-width: 1160px;

    margin: 0 auto;
  }

  &__title {
    @include adaptiveValue('font-size', 30, 24);

    margin: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 22);
    }
  }

  &__content {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.65;
    white-space: normal;

    overflow-wrap: anywhere;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4) {
      color: #f4d8c5 !important;
      font-family: var(--font-spectral) !important;
      font-weight: 500 !important;
      line-height: 1.25 !important;
      text-transform: none !important;

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(h1) {
      @include adaptiveValue('font-size', 30, 24);
      @include adaptiveValue('margin-top', 36, 22);
      @include adaptiveValue('margin-bottom', 24, 16);
    }

    :deep(h2) {
      @include adaptiveValue('font-size', 26, 21);
      @include adaptiveValue('margin-top', 32, 20);
      @include adaptiveValue('margin-bottom', 20, 14);
    }

    :deep(h3) {
      @include adaptiveValue('font-size', 22, 18);
      @include adaptiveValue('margin-top', 26, 18);
      @include adaptiveValue('margin-bottom', 16, 12);
    }

    :deep(h4) {
      @include adaptiveValue('font-size', 19, 16);
      @include adaptiveValue('margin-top', 22, 16);
      @include adaptiveValue('margin-bottom', 14, 10);
    }

    :deep(p) {
      display: inline-block;

      background: transparent !important;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      text-align: left !important;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 14);
      }

      &:first-child {
        display: block !important;

        color: var(--secondary-color) !important;
      }

      strong {
        color: #f4c6b3 !important;
      }
    }

    :deep(span) {
      background: transparent !important;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      text-transform: none !important;
    }

    :deep(ul),
    :deep(ol) {
      @include adaptiveValue('margin-bottom', 22, 14);
    }

    :deep(ul) {
      padding-left: 0;

      list-style: none;
    }

    :deep(ul li) {
      @include adaptiveValue('margin-bottom', 10, 6);

      position: relative;

      padding-left: 18px;

      list-style: none;

      &::before {
        position: absolute;
        top: 0;
        left: 0;

        opacity: 0.8;

        color: #f4c6b3;

        content: '•';
      }
    }

    :deep(ol) {
      padding-left: 24px;
    }

    :deep(ol li) {
      @include adaptiveValue('margin-bottom', 10, 6);

      list-style: decimal;
    }

    :deep(li) {
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
    }

    :deep(a),
    :deep(a span) {
      color: var(--hint-primary-color) !important;

      transition: all 0.3s ease 0s;

      @media (any-hover: hover) {
        &:hover {
          color: var(--secondary-color) !important;
        }
      }
    }

    :deep(blockquote) {
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);
      @include adaptiveValue('padding', 22, 16);

      border: 1px solid var(--border-fourth-color);
      border-left: 3px solid var(--hint-secondary-color);
      border-radius: 0 8px 8px 0;
      background: rgb(48 43 91 / 48%);

      color: var(--primary-color);
      font-style: italic;
    }

    :deep(pre) {
      @include adaptiveValue('padding', 18, 12);
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);

      overflow-x: auto;

      border: 1px solid var(--border-fourth-color);
      border-radius: 8px;
      background: rgb(24 20 56 / 90%);

      color: var(--primary-color);
    }

    :deep(code) {
      padding: 3px 7px;

      border-radius: 5px;
      background: rgb(24 20 56 / 90%);

      color: #f4c6b3;
    }

    :deep(strong),
    :deep(b) {
      color: #f4d8c5 !important;
      font-weight: 600 !important;
      text-transform: none !important;
    }

    :deep(em) {
      font-style: italic !important;
    }

    :deep(.br-space) {
      display: block;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    :deep(.table-scroll-wrapper) {
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);

      overflow-x: auto;

      width: 100%;
      max-width: 100%;

      border: 1px solid var(--border-fourth-color);
      border-radius: 10px;
    }

    :deep(table) {
      width: 100%;

      border: 1px solid var(--border-fourth-color);
      background: rgb(48 43 91 / 48%);

      border-collapse: collapse;
    }

    :deep(th) {
      @include adaptiveValue('padding-top', 16, 10);
      @include adaptiveValue('padding-right', 18, 10);
      @include adaptiveValue('padding-bottom', 16, 10);
      @include adaptiveValue('padding-left', 18, 10);

      border: 1px solid var(--border-fourth-color);
      background: rgb(66 58 112 / 65%);

      color: #f4d8c5 !important;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
      text-align: left;
    }

    :deep(td) {
      @include adaptiveValue('padding-top', 15, 10);
      @include adaptiveValue('padding-right', 18, 10);
      @include adaptiveValue('padding-bottom', 15, 10);
      @include adaptiveValue('padding-left', 18, 10);

      border: 1px solid var(--border-fourth-color);

      color: var(--primary-color) !important;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(tr:nth-child(even)) {
      background: rgb(25 22 60 / 25%);
    }

    :deep(tbody tr) {
      transition: background-color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          background: rgb(112 92 177 / 18%);
        }
      }
    }

    @media (max-width: $md4) {
      :deep(.table-scroll-wrapper) {
        overflow-x: auto;
      }

      :deep(table) {
        display: block;
        overflow-x: auto;

        min-width: 100%;

        font-size: 14px;
        white-space: normal;

        table-layout: fixed;
      }

      :deep(th),
      :deep(td) {
        min-width: 180px;

        padding: 10px 12px;

        font-size: 13px;
        white-space: normal;
        word-break: break-word;

        overflow-wrap: anywhere;
      }
    }
  }

  @media (max-width: $md4) {
    &__decoration {
      height: 25px;

      margin-bottom: 18px;

      img {
        max-height: 36px;
      }
    }
  }
}
</style>
