<template>
  <div class="bg" :class="scrollClass">
    <img class="bg-img" :src="bgImg" />
    <div class="container">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    bgImg: string
    bgColor?: string
    scrollable?: boolean
    objectFit: string
  }>(),
  {
    scrollable: true,
    bgColor: undefined,
  }
)

const scrollClass = computed(() => (props.scrollable ? 'scrollable' : 'fixed'))
</script>

<style lang="css">
.bg {
  width: 100vw;
  min-height: 100vh;
  font-size: 0;
  position: relative;
  background: v-bind(bgColor);
}

.fixed .bg-img {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: v-bind(objectFit);
}

.scrollable .bg-img {
  width: 100%;
  height: auto;
}

.container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
