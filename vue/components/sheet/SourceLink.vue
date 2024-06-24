<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    char: Object
})
</script>

<template>
    <div v-if="props.char.dndb_data?.id" class="source-link">
        <a :href="'https://www.dndbeyond.com/characters/' + char.dndb_data.id">
            <img src="https://www.google.com/s2/favicons?sz=16&amp;domain=www.dndbeyond.com">
            🡥
        </a>
    </div>
    <div v-if="props.char.roll20_data" class="source-link">
        <img src="https://www.google.com/s2/favicons?sz=16&amp;domain=app.roll20.net">
    </div>
</template>

<style scoped>
.source-link {
    margin-left: .5em;
    font-size: 16px;
    color: grey;
}

.source-link a {
    color: grey;
    text-decoration: none;
}

.source-link img {
    max-width: 16px;
    max-height: 16px;
}
</style>