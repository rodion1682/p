<template>
  <section class="static">
    <div class="static__inner _cnt">
      <LoadingSpinner v-if="loading" class="static__loading" />

      <div v-else-if="error" class="static__error _text-error">
        {{ error }}
      </div>

      <div v-else-if="currentPage" class="static__body">
        <div class="static__heading">
          <h1 class="static__title _h2">
            {{ currentPage.title }}
          </h1>
        </div>

        <div v-html="sanitizedContent" class="static__contet"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'

const DEBUG_STATIC_CONTENT = false

const DEBUG_STATIC_CONTENT_HTML = `
  <p><small>Last Updated: 23.10.2026</small></p>

  <p>This is a RelicForge static page design preview. It demonstrates the formatting of legal information, paragraphs, headings, links, tables, and other HTML content.</p>

  <p>All content in this preview is example text only. The normal website continues using the content provided by your existing static pages API.</p>

  <h1>Heading Level One</h1>
  <p>This is an H1 heading followed by a standard paragraph. It demonstrates how larger section headings appear within your content.</p>

  <h2>Heading Level Two</h2>
  <p>This is an H2 heading with <strong>bold text</strong>, <em>italic text</em>, and an <a href="#debug-table">internal link to the table</a>.</p>

  <h3>Heading Level Three</h3>
  <p>Third-level headings can be used for individual legal clauses or additional explanations.</p>

  <h4>Heading Level Four</h4>
  <p>This is smaller supporting content with <u>underlined text</u> and <s>strikethrough text</s>.</p>

  <h5>Heading Level Five</h5>
  <p>This is an example of a fifth-level heading.</p>

  <h6>Heading Level Six</h6>
  <p>This is an example of a sixth-level heading.</p>

  <hr>

  <h2>Unordered List</h2>

  <p>These are the main benefits of the new static-page layout:</p>

  <ul>
    <li>Improved readability on dark backgrounds</li>
    <li>Consistent spacing and typography</li>
    <li>Responsive tables without horizontal page scrolling</li>
    <li>Support for nested lists
      <ul>
        <li>First nested item</li>
        <li>Second nested item</li>
      </ul>
    </li>
  </ul>

  <h2>Ordered List</h2>

  <ol>
    <li>Read the relevant section.</li>
    <li>Review any additional requirements.</li>
    <li>Contact support if more information is needed.</li>
  </ol>

  <h2>Quotes and Important Information</h2>

  <blockquote>
    <p>This is a blockquote example. Important information is displayed in a dark panel with a blue accent border.</p>
    <cite>RelicForge design preview</cite>
  </blockquote>

  <p><strong>Important:</strong> This is an example of emphasized legal information within a paragraph.</p>

  <p>You can also display <mark>highlighted text</mark>, inline code such as <code>payment.status</code>, and keyboard shortcuts like <kbd>Ctrl</kbd> + <kbd>F</kbd>.</p>

  <h2 id="debug-table">Responsive Table</h2>

  <p>The example below has six columns. On smaller screens, each row becomes a readable card instead of requiring horizontal scrolling.</p>

  <table>
    <caption>Example transaction information — demonstration only</caption>
    <thead>
      <tr>
        <th>ID</th>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>10001</td>
        <td>23.10.2026</td>
        <td>Deposit</td>
        <td>50.00 €</td>
        <td>Successful</td>
        <td>Payment completed</td>
      </tr>
      <tr>
        <td>10002</td>
        <td>22.10.2026</td>
        <td>Purchase</td>
        <td>125.00 €</td>
        <td>Pending</td>
        <td>Awaiting processing</td>
      </tr>
      <tr>
        <td>10003</td>
        <td>21.10.2026</td>
        <td>Withdrawal</td>
        <td>75.00 €</td>
        <td>Canceled</td>
        <td>Transaction canceled</td>
      </tr>
    </tbody>
  </table>

  <h2>Additional Table Format</h2>

  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Description</th>
        <th>Requirement</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Account</td>
        <td>Information relating to user accounts</td>
        <td>Required for relevant account features</td>
      </tr>
      <tr>
        <td>Payments</td>
        <td>Information relating to purchases and deposits</td>
        <td>Required for transaction processing</td>
      </tr>
    </tbody>
  </table>

  <h2>Code and Preformatted Text</h2>

  <p>Inline code: <code>GET /static-pages</code></p>

  <pre><code>GET /static-pages
GET /static-pages/1
Status: OK
Content-Type: application/json</code></pre>

  <h2>Expandable Content</h2>

  <details>
    <summary>What information can be displayed here?</summary>
    <p>Expandable sections are useful for additional explanations, answers, and detailed policy information.</p>
  </details>

  <details>
    <summary>Do these sections support mobile layouts?</summary>
    <p>Yes. They expand to the available container width and wrap long text.</p>
  </details>

  <h2>Images and Captions</h2>

  <figure>
    <img src="/favicon.svg" alt="RelicForge logo">
    <figcaption>Example image with a caption.</figcaption>
  </figure>

  <h2>Paragraphs and Line Breaks</h2>

  <p>This paragraph contains a manual line break.<br>It continues on the next line.</p>

  <p>This is a separate paragraph showing how normal vertical spacing works between text blocks.</p>

  <hr>

  <h2>Contact Information</h2>

  <p>If you have questions, please contact <a href="mailto:support@relicforge.com">support@relicforge.com</a>.</p>
`

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()

const loading = computed(() => {
  return DEBUG_STATIC_CONTENT ? false : staticStore.loading
})

const error = computed(() => {
  return DEBUG_STATIC_CONTENT ? null : staticStore.error
})

const currentPage = computed(() => {
  if (DEBUG_STATIC_CONTENT) {
    return {
      title: 'STATIC CONTENT STYLE GUIDE',
      content: DEBUG_STATIC_CONTENT_HTML,
    }
  }

  return staticStore.currentPage
})

const sanitizedContent = computed(() => {
  if (!currentPage.value?.content) return ''

  let content = String(currentPage.value.content)
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')

  content = content.replace(
    /(<br\s*\/?>\s*){2,}/gi,
    '<div class="br-space"></div>',
  )

  return content
})

const prepareResponsiveTables = async () => {
  await nextTick()

  const container = document.querySelector('.static__contet')

  if (!container) return

  const tables = container.querySelectorAll('table')

  tables.forEach(table => {
    const rows = Array.from(table.querySelectorAll('tr'))

    const headerRow =
      table.querySelector('thead tr:last-child') ||
      rows.find(row => {
        const cells = Array.from(row.children)

        return cells.length > 0 && cells.every(cell => cell.tagName === 'TH')
      })

    const headers = headerRow
      ? Array.from(headerRow.children)
          .filter(cell => cell.matches('th, td'))
          .map(cell => cell.textContent.trim())
      : []

    rows.forEach(row => {
      if (row === headerRow) return

      let columnIndex = 0

      Array.from(row.children)
        .filter(cell => cell.matches('th, td'))
        .forEach(cell => {
          const label = headers[columnIndex] || `Column ${columnIndex + 1}`

          cell.setAttribute('data-label', label)

          columnIndex += Number(cell.colSpan || 1)
        })
    })
  })
}

const fetchPage = async () => {
  if (DEBUG_STATIC_CONTENT) return

  const slug = route.params.slug

  if (!slug) {
    router.push({ name: 'NotFound' })
    return
  }

  try {
    await staticStore.fetchPage({ slug })

    if (!staticStore.currentPage) {
      router.push({ name: 'NotFound' })
    }
  } catch (e) {
    router.push({ name: 'NotFound' })
  }
}

watch(() => route.params.slug, fetchPage, { immediate: true })

watch(sanitizedContent, prepareResponsiveTables, {
  immediate: true,
  flush: 'post',
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.static {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-width: 0;

  background-color: var(--bg-primary-color);

  @include adaptiveValue('padding-top', 135, 90);
  @include adaptiveValue('padding-bottom', 130, 60);

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1 1 100%;

    width: 100%;
    min-width: 0;
  }

  &__loading,
  &__error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;
    margin: auto;
  }

  &__body {
    width: 100%;
    max-width: 1120px;
    min-width: 0;
    margin: 0 auto;
  }

  &__heading {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;

    @include adaptiveValue('margin-bottom', 50, 28);
  }

  &__title {
    margin: 0;

    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;

    overflow-wrap: anywhere;
  }

  &__contet {
    width: 100%;
    min-width: 0;
    max-width: 100%;

    color: #aeb8c8;
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.75;

    white-space: pre-line;
    overflow-wrap: anywhere;
    word-break: normal;

    :deep(*) {
      box-sizing: border-box;
      max-width: 100%;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      display: block;

      color: #f4f6fb !important;
      font-family: var(--font-orbitron) !important;
      font-weight: 700 !important;
      line-height: 1.4 !important;
      text-transform: none !important;
      letter-spacing: 0;

      overflow-wrap: anywhere;

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(h1) {
      font-size: clamp(22px, 2.5vw, 30px) !important;
      margin: 42px 0 20px;
    }

    :deep(h2) {
      font-size: clamp(19px, 2vw, 23px) !important;
      margin: 38px 0 18px;
    }

    :deep(h3) {
      font-size: clamp(16px, 1.5vw, 19px) !important;
      margin: 30px 0 15px;
    }

    :deep(h4) {
      font-size: 16px !important;
      margin: 26px 0 12px;
    }

    :deep(h5) {
      font-size: 15px !important;
      margin: 22px 0 12px;
    }

    :deep(h6) {
      font-size: 14px !important;
      margin: 20px 0 10px;
      color: #65a7ff !important;
    }

    :deep(p) {
      display: block;
      margin: 0 0 16px;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: 400;
      line-height: inherit !important;
      text-align: left;

      background: transparent !important;
      white-space: pre-line;
    }

    :deep(p:last-child) {
      margin-bottom: 0;
    }

    :deep(small) {
      color: #8995a7;
      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.5;
    }

    :deep(span) {
      font-family: inherit;
      line-height: inherit;
    }

    :deep(strong),
    :deep(b) {
      color: #f4f6fb !important;
      font-weight: 700 !important;
      text-transform: none !important;
    }

    :deep(em),
    :deep(i) {
      color: inherit;
      font-style: italic;
    }

    :deep(u) {
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    :deep(s) {
      opacity: 0.7;
      text-decoration: line-through;
    }

    :deep(a) {
      color: #65a7ff !important;
      text-decoration: underline;
      text-decoration-color: rgba(101, 167, 255, 0.45);
      text-underline-offset: 3px;

      transition:
        color 0.25s ease,
        text-decoration-color 0.25s ease;

      overflow-wrap: anywhere;

      @media (any-hover: hover) {
        &:hover {
          color: #a9ceff !important;
          text-decoration-color: currentColor;
        }
      }
    }

    :deep(ul),
    :deep(ol) {
      display: block;
      margin: 15px 0 24px;
      padding-left: 25px;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      display: list-item;
      margin-bottom: 9px;
      padding-left: 4px;

      color: inherit;
      font-family: var(--font-inter);
      font-size: inherit;
      line-height: 1.65;

      overflow-wrap: anywhere;
    }

    :deep(ul li) {
      list-style-type: disc;
    }

    :deep(ul li::marker) {
      color: #1a73ff;
    }

    :deep(ol li::marker) {
      color: #65a7ff;
      font-weight: 600;
    }

    :deep(li ul),
    :deep(li ol) {
      margin: 10px 0 12px;
    }

    :deep(blockquote) {
      position: relative;
      margin: 28px 0;
      padding: 22px 25px;

      border-left: 3px solid #1a73ff;
      border-radius: 0 10px 10px 0;

      background: #111821;

      color: #c4cede;
      font-family: var(--font-inter);
      font-size: 15px;
      font-style: italic;
      line-height: 1.75;

      p {
        margin: 0;
        font-style: italic;
      }

      cite {
        display: block;
        margin-top: 12px;
        color: #65a7ff;
        font-size: 12px;
        font-style: normal;
      }
    }

    :deep(hr) {
      display: block;
      width: 100%;
      height: 1px;

      margin: 32px 0;

      border: 0;
      background: linear-gradient(
        90deg,
        rgba(153, 161, 176, 0.18),
        rgba(26, 115, 255, 0.35),
        rgba(153, 161, 176, 0.18)
      );
    }

    :deep(code),
    :deep(kbd) {
      padding: 3px 7px;

      border: 1px solid #344050;
      border-radius: 5px;
      background-color: #202631;

      color: #87b6ff;
      font-family: monospace;
      font-size: 0.9em;

      overflow-wrap: anywhere;
    }

    :deep(kbd) {
      color: #f4f6fb;
    }

    :deep(pre) {
      display: block;
      width: 100%;
      max-width: 100%;

      margin: 22px 0;
      padding: 20px;

      border: 1px solid #303948;
      border-radius: 10px;
      background-color: #111821;

      color: #d1deef;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.8;

      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: break-word;
      overflow: hidden;
    }

    :deep(pre code) {
      display: block;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font-size: inherit;
      white-space: inherit;
    }

    :deep(mark) {
      padding: 2px 5px;
      border-radius: 3px;
      background-color: rgba(26, 115, 255, 0.2);
      color: #d6e7ff;
    }

    :deep(.br-space) {
      display: block;
      height: 15px;
    }

    :deep(.table-scroll-wrapper) {
      width: 100%;
      max-width: 100%;
      margin: 24px 0;
      overflow: visible !important;
    }

    :deep(table) {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;

      margin: 26px 0;

      border: 1px solid #303948;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 10px;

      background-color: #111821;
      color: #f4f6fb;

      table-layout: fixed;
      overflow: hidden;
    }

    :deep(caption) {
      padding: 0 0 12px;
      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.5;
      text-align: left;
      caption-side: top;
    }

    :deep(thead) {
      background-color: #192331;
    }

    :deep(th),
    :deep(td) {
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;

      padding: 15px 14px;

      border: 0;
      border-bottom: 1px solid rgba(153, 161, 176, 0.12);

      color: #dce4f0 !important;
      font-family: var(--font-inter);
      font-size: 13px;
      line-height: 1.5;
      font-weight: 400;
      text-align: left;

      background: transparent !important;

      white-space: normal !important;
      overflow-wrap: anywhere;
      word-break: break-word;
      vertical-align: middle;
    }

    :deep(th) {
      color: #99a1b0 !important;
      font-size: 12px;
      font-weight: 600;
    }

    :deep(tbody tr:last-child td),
    :deep(tbody tr:last-child th) {
      border-bottom: 0;
    }

    :deep(tbody tr) {
      transition: background-color 0.2s ease;

      @media (any-hover: hover) {
        &:hover {
          background-color: rgba(26, 115, 255, 0.045);
        }
      }
    }

    :deep(figure) {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      margin: 25px 0;
      padding: 20px;

      border: 1px solid #303948;
      border-radius: 10px;
      background-color: #111821;
    }

    :deep(img) {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 420px;
      object-fit: contain;
      border-radius: 6px;
    }

    :deep(figcaption) {
      color: #8995a7;
      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.5;
    }

    :deep(details) {
      width: 100%;
      min-width: 0;

      margin: 12px 0;
      padding: 18px 20px;

      border: 1px solid #303948;
      border-radius: 9px;

      background-color: #111821;

      &[open] {
        border-color: rgba(26, 115, 255, 0.4);
      }
    }

    :deep(summary) {
      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
      cursor: pointer;

      &::marker {
        color: #65a7ff;
      }
    }

    :deep(details p) {
      margin: 15px 0 0;
      color: #aeb8c8 !important;
    }
  }

  @media (max-width: $md3) {
    &__body {
      max-width: 100%;
    }

    &__contet {
      font-size: 14px;
      line-height: 1.7;

      :deep(table) {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;

        padding: 0;
        margin: 22px 0;

        border: 0;
        border-radius: 0;
        background: transparent;
        overflow: visible;
      }

      :deep(caption) {
        display: block;
        padding: 0 0 12px;
      }

      :deep(thead) {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip-path: inset(50%);
        white-space: nowrap !important;
      }

      :deep(tbody),
      :deep(tfoot) {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        width: 100% !important;
        min-width: 0 !important;
      }

      :deep(tbody tr),
      :deep(tfoot tr) {
        display: flex !important;
        flex-direction: column;

        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;

        padding: 15px;

        border: 1px solid #303948;
        border-radius: 10px;

        background-color: #111821;
      }

      :deep(tbody td),
      :deep(tbody th),
      :deep(tfoot td),
      :deep(tfoot th) {
        display: flex !important;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;

        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;

        padding: 12px 0;

        border: 0;
        border-bottom: 1px solid rgba(153, 161, 176, 0.1);

        color: #f4f6fb !important;
        font-size: 12px;
        font-weight: 500;
        text-align: right;

        white-space: normal !important;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      :deep(tbody tr > :last-child),
      :deep(tfoot tr > :last-child) {
        padding-bottom: 0;
        border-bottom: 0;
      }

      :deep(tbody td::before),
      :deep(tbody th::before),
      :deep(tfoot td::before),
      :deep(tfoot th::before) {
        content: attr(data-label);
        display: block;
        flex: 0 0 38%;
        min-width: 0;

        color: #8995a7;
        font-family: var(--font-inter);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.5;
        text-align: left;

        white-space: normal;
        overflow-wrap: anywhere;
      }

      :deep(table p) {
        text-align: right !important;
      }
    }
  }

  @media (max-width: $md5) {
    &__heading {
      margin-bottom: 26px;
    }

    &__contet {
      font-size: 13px;
      line-height: 1.7;

      :deep(h1) {
        font-size: 22px !important;
        margin: 30px 0 15px;
      }

      :deep(h2) {
        font-size: 19px !important;
        margin: 27px 0 15px;
      }

      :deep(h3) {
        font-size: 16px !important;
        margin: 24px 0 12px;
      }

      :deep(blockquote) {
        padding: 18px;
        font-size: 13px;
      }

      :deep(ul),
      :deep(ol) {
        padding-left: 22px;
      }

      :deep(pre) {
        padding: 14px;
        font-size: 11px;
      }

      :deep(tbody),
      :deep(tfoot) {
        grid-template-columns: minmax(0, 1fr);
      }

      :deep(tbody tr),
      :deep(tfoot tr) {
        padding: 16px;
      }

      :deep(tbody td),
      :deep(tbody th),
      :deep(tfoot td),
      :deep(tfoot th) {
        font-size: 12px;
      }

      :deep(figure) {
        padding: 15px;
      }

      :deep(details) {
        padding: 15px;
      }
    }
  }
}
</style>
