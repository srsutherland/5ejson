<script setup>
import ExportPDF from './ExportPDF.vue'
import ExportJSON from './ExportJSON.vue'

const props = defineProps({
    char: Object
})

const sheet_names = ["1page_v6", "halfpage_double_color", "standard"];
</script>

<template>
    <div id="export">
        Export:
        <ExportPDF v-for="p in sheet_names" :char="props.char" :pdf="p"/>
        <ExportJSON :char="props.char" :new-tab="false"/>
        <ExportJSON :char="props.char" :new-tab="true"/>
    </div>
</template>