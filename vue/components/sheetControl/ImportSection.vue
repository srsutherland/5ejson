<script setup>
import ImportSampleChar from "./ImportSampleChar.vue"
import Import5ejson from "./Import5ejson.vue"
import ImportDndb from "./ImportDndb.vue"
import ImportSampleRoll20 from "./ImportSampleRoll20.vue"

// This just passes the loadChar event from the other components up to the parent
const emit = defineEmits(["loadChar"])

const loadChar = (char) => {
    emit("loadChar", char)
}
</script>

<template>
    <div id="import">
        <span>Import:</span>
        <Import5ejson @loadChar="loadChar" />
        <ImportDndb @loadChar="loadChar" />
        <ImportSampleChar @loadChar="loadChar" />
        <ImportSampleRoll20 @loadChar="loadChar" />
    </div>
</template>