<script setup>
import { ref } from 'vue'

import TheSheet from './components/sheet/TheSheet.vue'
import ExportSection from './components/sheetControl/ExportSection.vue';
import ImportSection from './components/sheetControl/ImportSection.vue';

import { dndbeyond_json_parse } from '../src/dndbeyond.js'
import { roll20_json_parse } from '../src/roll20.js'
import { setLastLoaded, getLastLoaded } from './components/sheetControl/lastLoaded.js'

const char = ref(null)

const onCharLoaded = (newChar) => {
    if (!newChar) {
        console.error("onCharLoaded called without an argument")
    }
    console.log("Char loaded", newChar)
    char.value = newChar
    window.char = newChar
    window.character = newChar
}

const last_loaded = getLastLoaded()
if (last_loaded.json) {
    const json = last_loaded.json
    const json_type = last_loaded.type
    if (json_type == "5ejson") {
        const character = json
        onCharLoaded(character)
    } else if (json_type == "dndb") {
        const character = dndbeyond_json_parse(json)
        onCharLoaded(character)
    } else if (json_type == "roll20") {
        const character = roll20_json_parse(json)
        onCharLoaded(character)
    }
} else {
    fetch("test_json/dndb/Jack.dndb.json").then(r => r.json())
    .then(json => {
        setLastLoaded(json, "dndb")
        try {
            const character = dndbeyond_json_parse(json)
            onCharLoaded(character)
            //log_elem.textContent = ""
        } catch (err) {
            console.error(err)
            //log_elem.textContent = err
            return
        }
    }).catch(err => {
        console.error(err)
        //log_elem.textContent = err
    })
}
</script>

<template>
    <main id="sheet-contain">
        <TheSheet v-if="char" :char="char" />
        <TheSheet v-else />
    </main>
    <footer id="control-contain">
        <ExportSection :char="char" />
        <ImportSection @loadChar="onCharLoaded" />
    </footer>
</template>