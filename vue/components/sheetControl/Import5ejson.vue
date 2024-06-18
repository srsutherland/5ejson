<script setup>
import { getJsonUpload } from '../../lib/util.js'
import { setLastLoaded } from './lastLoaded.js';

const emit = defineEmits(["loadChar"])

const loadChar = () => {
    getJsonUpload().then((json) => {
        emit("loadChar", json)
        setLastLoaded(json, "5ejson")
    })
}
</script>

<template>
    <button @click="loadChar">Import 5ejson</button>
</template>