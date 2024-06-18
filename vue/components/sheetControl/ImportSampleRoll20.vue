<script setup>
import { roll20_json_parse } from "../../../src/roll20"

const emit = defineEmits(["loadChar"])
import { setLastLoaded } from './lastLoaded.js';

const loadSampleRoll20 = () => {
    const path = "./test_json/roll20/Bard16_Zag_Moondust.roll20.json"
    fetch(path)
        .then((response) => response.json())
        .then((roll20_json) => {
            const json = roll20_json_parse(roll20_json)
            emit("loadChar", json)
            setLastLoaded(roll20_json, "roll20")
        }).catch((error) => {
            console.error(`Error loading sample character from "${path}"`, error)
        })
}
</script>

<template>
    <button @click="loadSampleRoll20">
        Load Sample Roll20
    </button>
</template>