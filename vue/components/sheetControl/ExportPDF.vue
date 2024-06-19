<script setup>
import { fillForm } from '../../../src/pdf.js'

const props = defineProps({
    char: Object,
    pdf: String
})

const exportPDF = () => {
    console.log("Exporting PDF: " + props.pdf)
    const sheet_name = props.pdf
    if (!sheet_name) {
        console.error("No sheet name provided")
        return
    }
    if (!props.char) {
        console.error("No character provided")
        return
    } 
    fillForm(
        `pdfs/${sheet_name}/sheet.pdf`, 
        `pdfs/${sheet_name}/sheet.json`, 
        props.char,
        //(str) => { log_elem.textContent = str }
    )
}
</script>

<template>
    <span>
        <button @click="exportPDF">{{ pdf }}.pdf</button>
    </span>
</template>