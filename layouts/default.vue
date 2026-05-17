<template>
  <div class="app-shell" :class="{ dark: themeStore.isDark }">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">📔</span>
        <span class="brand-name">Mémoire</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-bottom">
        <!-- Stats -->
        <div class="sidebar-stats">
          <div class="stat">
            <div class="stat-val">{{ store.stats.totalNotes }}</div>
            <div class="stat-key">заметок</div>
          </div>
          <div class="stat">
            <div class="stat-val">{{ store.stats.totalPhotos }}</div>
            <div class="stat-key">фото</div>
          </div>
          <div class="stat">
            <div class="stat-val">{{ store.stats.streak }}</div>
            <div class="stat-key">дней подряд</div>
          </div>
        </div>

        <!-- Theme toggle -->
        <button class="theme-btn" @click="themeStore.toggle()">
          <span>{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
          <span>{{ themeStore.isDark ? 'Светлая тема' : 'Тёмная тема' }}</span>
        </button>
      </div>
    </aside>

    <!-- Mobile bottom bar -->
    <nav class="mobile-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="mobile-nav-item"
        active-class="mobile-nav-item--active"
      >
        <span class="mobile-nav-icon">{{ item.icon }}</span>
        <span class="mobile-nav-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const store = useNotesStore()

const navItems = [
  { to: '/',         icon: '🏠', label: 'Сегодня' },
  { to: '/calendar', icon: '📅', label: 'Календарь' },
  { to: '/notes',    icon: '📝', label: 'Заметки' },
  { to: '/gallery',  icon: '🖼️', label: 'Галерея' },
]

onMounted(() => {
  themeStore.load()
  store.load()
  document.documentElement.setAttribute('data-theme', themeStore.isDark ? 'dark' : 'light')
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #f5f4fc;
  transition: background 0.2s;
}
.app-shell.dark {
  background: #111118;
  color: #e8e6ff;
}

.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #fff;
  border-right: 1px solid #ece9ff;
  display: flex;
  flex-direction: column;
  padding: 24px 12px 20px;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: background 0.2s, border-color 0.2s;
}
.dark .sidebar {
  background: #16161f;
  border-color: #2a2840;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 24px;
}
.brand-icon { font-size: 28px; }
.brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #7C6EF5, #b59cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}
.nav-item:hover { background: #f0eeff; color: #7C6EF5; }
.nav-item--active { background: #ede9ff; color: #7C6EF5; font-weight: 700; }
.dark .nav-item { color: #9e9cc0; }
.dark .nav-item:hover { background: #22203a; color: #b59cff; }
.dark .nav-item--active { background: #22203a; color: #b59cff; }

.nav-icon { font-size: 18px; }
.nav-label {}

.sidebar-bottom { margin-top: auto; }
.sidebar-stats {
  display: flex;
  justify-content: space-around;
  padding: 14px 4px;
  border-top: 1px solid #ece9ff;
  border-bottom: 1px solid #ece9ff;
  margin-bottom: 12px;
}
.dark .sidebar-stats { border-color: #2a2840; }
.stat { text-align: center; }
.stat-val { font-size: 18px; font-weight: 800; color: #7C6EF5; }
.stat-key { font-size: 10px; color: #999; margin-top: 1px; }
.dark .stat-key { color: #666; }

.theme-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  border: none;
  background: #f5f4fc;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.15s;
}
.theme-btn:hover { background: #ede9ff; color: #7C6EF5; }
.dark .theme-btn { background: #1c1c28; color: #9e9cc0; }
.dark .theme-btn:hover { background: #22203a; color: #b59cff; }

.main-content {
  margin-left: 220px;
  flex: 1;
  min-height: 100vh;
  padding: 32px;
}

.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  border-top: 1px solid #ece9ff;
  z-index: 200;
  padding: 8px 0 env(safe-area-inset-bottom, 0);
}
.dark .mobile-nav { background: #16161f; border-color: #2a2840; }

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: #999;
  flex: 1;
  padding: 4px 0;
}
.mobile-nav-item--active { color: #7C6EF5; }
.mobile-nav-icon { font-size: 22px; }
.mobile-nav-label { font-size: 10px; font-weight: 600; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; padding: 16px 16px 80px; }
  .mobile-nav { display: flex; }
}
</style>
