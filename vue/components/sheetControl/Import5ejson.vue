<script setup>
import { getJsonUpload } from '../../lib/util.js'

const emit = defineEmits(["loadChar"])

const loadChar = () => {
    getJsonUpload().then((json) => {
        emit("loadChar", json)
    })
}
</script>

<template>
    <button @click="loadChar">Import 5ejson</button>
</template>