<script setup>
import samplePaths from "./sampleChars.cjs"

import { dndbeyond_json_parse } from "../../../src/dndbeyond";
import { setLastLoaded } from './lastLoaded.js';

const path_re = /(^|.*\/)([^./]+)\.(\w+)\.json/i
const defaultPath = "Jack.dndb.json"
class SampleChar {
    constructor(path) {
        const m = path.match(path_re)
        if (m) {
            this.path = "./test_json/dndb/" + path
            this.name = path === defaultPath ? m[2] + " (default)" : m[2] 
            this.type = m[3]
        } else {
            this.path = this.name = this.type = "error"
        }
    }
}
const sampleChars = samplePaths.map(path => new SampleChar(path))

// emits "loadChar" which contains a 5ejson character object
const emit = defineEmits(["loadChar"])

const loadSampleChar = () => {
    const select = document.getElementById("sample-chars")
    const path = select.value
    fetch(path)
        .then((response) => response.json())
        .then((dndb_json) => {
            const json = dndbeyond_json_parse(dndb_json)
            emit("loadChar", json)
            setLastLoaded(dndb_json, "dndb")
        }).catch((error) => {
            console.error(`Error loading sample character from "${path}"`, error)
        })
}
</script>

<template>
    <select id="sample-chars">
        <option v-for="schar in sampleChars" :value="schar.path">
            {{ schar.name }}
        </option>
    </select>
    <button @click="loadSampleChar">
        Load Sample Char
    </button>
</template>