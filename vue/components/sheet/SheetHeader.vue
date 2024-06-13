<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    char: Object
})
</script>

<template>
    <header id="top-header">
        <h1 id="name">{{ props.char.name || "Name" }}</h1>
        <h2 id="race">{{ props.char.race }}</h2>
        <h2 id="class">{{ props.char.class }}</h2>
    </header>
</template>