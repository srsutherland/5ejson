<script setup>
import { getJsonUpload } from '../../lib/util.js'
import { dndbeyond_json_parse } from "../../../src/dndbeyond";

const emit = defineEmits(["loadChar"])

const loadChar = () => {
    getJsonUpload().then((dndb_json) => {
        const json = dndbeyond_json_parse(dndb_json)
        console.log({dndb_json, json})
        emit("loadChar", json)
    })
}
</script>

<template>
    <button @click="loadChar">Import D&D Beyond</button>
</template>