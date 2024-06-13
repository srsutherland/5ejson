<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
    char: Object
})
</script>

<template>
    <header id="top-header">
        <h1>test</h1>
        <h1 id="name">{{ props.char.name }}</h1>
        <h2 id="race"></h2>
        <h2 id="class"></h2>
    </header>
</template>