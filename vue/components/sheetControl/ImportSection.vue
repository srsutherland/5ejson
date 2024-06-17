<script setup>
import ImportSampleChar from "./ImportSampleChar.vue"
// const props = defineProps({
//     char: Object
// })

// This just passes the loadChar event from the other components
const emit = defineEmits(["loadChar"])

const loadChar = (char) => {
    emit("loadChar", char)
}
</script>

<template>
    <div id="import">
        <span>Import:</span>
        <!--Import 5ejson-->
        <!--Import dndb-->
        <ImportSampleChar @loadChar="loadChar" />
    </div>
</template>