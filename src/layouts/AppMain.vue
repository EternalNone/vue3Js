<script setup></script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="el-fade-in" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style lang="scss" scoped></style>
