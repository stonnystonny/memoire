<template>
  <NuxtRouteAnnouncer />
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NNotificationProvider>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </NNotificationProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NNotificationProvider,
  darkTheme,
} from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

const theme = computed(() => themeStore.isDark ? darkTheme : null)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#7C6EF5',
    primaryColorHover: '#9589F8',
    primaryColorPressed: '#6357D4',
    primaryColorSuppl: '#9589F8',
    borderRadius: '10px',
    fontFamily: 'Lato, sans-serif',
  },
  Card: {
    borderRadius: '14px',
  },
  Button: {
    borderRadiusMedium: '10px',
  },
  Input: {
    borderRadius: '10px',
  },
  Select: {
    peers: { InternalSelection: { borderRadius: '10px' } },
  },
  Modal: {
    borderRadius: '16px',
  },
}
</script>
