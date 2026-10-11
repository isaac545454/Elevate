<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { onPageParamChange, readPageParam, writePageParam } from '../../shared/page-url'
import { nativeAssetUrl } from '../../shared/event-bus'

const PAGE_SIZE = 12
const TOTAL_POSTS = 100
const TOTAL_PAGES = Math.max(1, Math.ceil(TOTAL_POSTS / PAGE_SIZE))

type Post = {
  userId: number
  id: number
  title: string
  body: string
}

type PostRow = Post & {
  coverImageSrc: string
}

const page = ref(Math.min(readPageParam(), TOTAL_PAGES))
const posts = ref<PostRow[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

let unsubscribePopstate: (() => void) | undefined

if (page.value !== readPageParam()) {
  writePageParam(page.value)
}

async function loadPosts(nextPage: number) {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/posts?_page=${nextPage}&_limit=${PAGE_SIZE}`,
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Post[]
    posts.value = data.map((post) => ({
      ...post,
      coverImageSrc: nativeAssetUrl(
        `https://picsum.photos/seed/jsonplaceholder-${post.id}/600/375`,
      ),
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    posts.value = []
  } finally {
    loading.value = false
  }
}

function setPage(nextPage: number) {
  const clamped = Math.min(Math.max(1, nextPage), TOTAL_PAGES)
  if (clamped === page.value) return
  page.value = clamped
  writePageParam(clamped)
}

watch(page, (nextPage) => {
  void loadPosts(nextPage)
}, { immediate: true })

onMounted(() => {
  unsubscribePopstate = onPageParamChange((nextPage) => {
    page.value = Math.min(Math.max(1, nextPage), TOTAL_PAGES)
  })
})

onUnmounted(() => unsubscribePopstate?.())
</script>

<template>
  <div class="mfe-panel mfe-panel--jsonplaceholder">
    <div class="mfe-panel__header">
      <h2>JSONPlaceholder</h2>
      <p>Posts via <code>jsonplaceholder.typicode.com</code></p>
    </div>

    <div
      v-if="loading"
      class="mfe-panel__grid"
      role="status"
      aria-live="polite"
      aria-label="Carregando lista"
    >
      <div v-for="n in PAGE_SIZE" :key="n" class="mfe-item mfe-item--skeleton" aria-hidden="true">
        <div class="mfe-skeleton mfe-skeleton--image" />
        <div class="mfe-item__body">
          <div class="mfe-skeleton mfe-skeleton--title" />
          <div class="mfe-skeleton mfe-skeleton--line" />
          <div class="mfe-skeleton mfe-skeleton--line mfe-skeleton--line-short" />
          <div class="mfe-skeleton mfe-skeleton--meta" />
        </div>
      </div>
    </div>
    <div v-else-if="error" class="mfe-panel__status mfe-panel__status--error">
      Erro: {{ error }}
    </div>
    <template v-else>
      <ul class="mfe-panel__grid">
        <li v-for="post in posts" :key="post.id" class="mfe-item">
          <img :src="post.coverImageSrc" :alt="post.title" class="mfe-item__image" />
          <div class="mfe-item__body">
            <h3 class="mfe-item__title">{{ post.title }}</h3>
            <p class="mfe-item__desc">{{ post.body }}</p>
            <span class="mfe-item__meta">Post #{{ post.id }} · usuário {{ post.userId }}</span>
          </div>
        </li>
      </ul>

      <nav class="mfe-pagination" aria-label="Paginação">
        <button
          type="button"
          class="mfe-pagination__btn"
          :disabled="page <= 1"
          @click="setPage(page - 1)"
        >
          Anterior
        </button>
        <span class="mfe-pagination__status">Página {{ page }} de {{ TOTAL_PAGES }}</span>
        <button
          type="button"
          class="mfe-pagination__btn"
          :disabled="page >= TOTAL_PAGES"
          @click="setPage(page + 1)"
        >
          Próxima
        </button>
      </nav>
    </template>
  </div>
</template>
