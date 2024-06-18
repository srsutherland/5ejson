<script setup>
import { getJsonUpload } from '../../lib/util.js'
import { dndbeyond_json_parse } from "../../../src/dndbeyond";
import { setLastLoaded } from './lastLoaded.js';

const emit = defineEmits(["loadChar"])

const loadChar = () => {
    getJsonUpload().then((dndb_json) => {
        const json = dndbeyond_json_parse(dndb_json)
        console.log({dndb_json, json})
        emit("loadChar", json)
        setLastLoaded(dndb_json, "dndb")
    })
}
</script>

<template>
    <button @click="loadChar">Import D&D Beyond</button>
</template>