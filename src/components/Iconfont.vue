<template>
  <i 
    v-if="type === 'font-class'"
    :class="iconClass"
    :style="iconStyle"
    class="iconfont"
  />
  <svg 
    v-else-if="type === 'symbol'"
    :class="iconClass"
    :style="iconStyle"
    class="iconfont"
    aria-hidden="true"
  >
    <use :xlink:href="`#${iconName}`" />
  </svg>
  <span 
    v-else
    :class="iconClass"
    :style="iconStyle"
    class="iconfont"
    v-text="unicode"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  type?: 'unicode' | 'font-class' | 'symbol'
  size?: string | number
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'font-class',
  size: 16,
  color: '#333333',
  className: ''
})

const iconClass = computed(() => {
  const classes: string[] = []
  
  if (props.type === 'font-class') {
    classes.push(`icon-${props.name}`)
  }
  
  if (props.className) {
    classes.push(props.className)
  }
  
  return classes
})

const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color
}))

const unicode = computed(() => {
  return `&#x${props.name};`
})

const iconName = computed(() => {
  return `icon-${props.name}`
})
</script>

<style scoped>
.iconfont {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1;
}

.iconfont svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>