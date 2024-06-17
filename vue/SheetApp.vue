<script setup>
import { ref } from 'vue'

import TheSheet from './components/sheet/TheSheet.vue'
import ExportSection from './components/sheetControl/ExportSection.vue';
import ImportSection from './components/sheetControl/ImportSection.vue';

const char = ref(null)

const onCharLoaded = (newChar) => {
    console.log("Char loaded", newChar)
    char.value = newChar
    window.char = newChar
    window.character = newChar
}
</script>

<template>
    <main id="sheet-contain">
        <TheSheet v-if="char" :char="char" />
        <TheSheet v-else />
    </main>
    <footer id="control-contain">
        Test
        <ExportSection />
        <ImportSection @loadChar="onCharLoaded" />
    </footer>
</template>