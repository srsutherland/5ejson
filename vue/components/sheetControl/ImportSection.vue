<script setup>
import ImportSampleChar from "./ImportSampleChar.vue"
import Import5ejson from "./Import5ejson.vue"
import ImportDndb from "./ImportDndb.vue"
import ImportSampleRoll20 from "./ImportSampleRoll20.vue"

import { dndbeyond_json_parse } from "../../../src/dndbeyond";

// This just passes the loadChar event from the other components up to the parent
const emit = defineEmits(["loadChar"])

const loadChar = (char) => {
    emit("loadChar", char)
}
</script>

<template>
    <div id="import">
        <span>Import:</span>
        <!--Import 5ejson-->
        <Import5ejson @loadChar="loadChar" />
        <!--Import dndb-->
        <ImportDndb @loadChar="loadChar" />
        <ImportSampleChar @loadChar="loadChar" />
        <ImportSampleRoll20 @loadChar="loadChar" />
    </div>
</template>