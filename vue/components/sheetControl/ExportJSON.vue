<script setup>
const props = defineProps({
    char: Object,
    newTab: Boolean
})

const exportJSON = () => {
    // Convert the JSON object to a formatted string
    const prefixes = ["dndb_", "roll20_"]
    const replacer = (k, v) => prefixes.some(p => k.match(p)) ? null : v;
    const jsonData = JSON.stringify(props.char, replacer, 2);
    // Create a Blob object with the JSON data and set the mime type
    const blob = new Blob([jsonData], {type: "application/json"});
    // Create a URL for the Blob object
    const url = URL.createObjectURL(blob);
    if (!props.newTab) {
        // Create a link element and click it to download the file
        const link = document.createElement("a");
        link.href
        link.href = url;
        link.download = props.char.name + ".char.json";
        link.click();
    } else {
        // Open a new window and set the Content-Type header to application/json
        const newPage = window.open(url, '_blank');
        const  xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    }
}
</script>

<template>
    <span>
        <button @click="exportJSON">{{ newTab ? "5ejson (new tab)" : "5ejson" }}</button>
    </span>
</template>