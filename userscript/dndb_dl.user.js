// ==UserScript==
// @name         D&DBeyond JSON Downloader
// @namespace    dragonfang.tech
// @version      2023.07.11
// @description  Download D&DBeyond character sheet as JSON file with ctrl+s
// @author       srsutherland
// @license      MIT
// @match        *://*.dndbeyond.com/characters/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dndbeyond.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Download the sheet as JSON
    const dlJSON = () => {
        const charid = window.location.href.match(/https:\/\/www\.dndbeyond\.com\/characters\/(\d+)/)[1];
        fetch(`https://character-service.dndbeyond.com/character/v5/character/${charid}?includeCustomItems=true`).then(r => r.text()).then(content => {
            const response = JSON.parse(content);
            if (!response.success) {
                alert("Error downloading character sheet. Character might be private.");
                console.error(response);
                // reject the promise so the rest of the function doesn't run
                return Promise.reject(response);
            }
            const char = JSON.parse(content).data;
            const charname = char.name;
            const charclass = char.classes.length > 1 ?
                ("multi" + char.classes.map(c => c.definition.name + c.level).join('')) :
                char.classes[0].definition.name + char.classes[0].level;
            const exportName = `${charclass}_${charname.replace(" ", "_")}.json`;
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", exportName);
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    };
    
    // Download on ctrl++s
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            dlJSON();
        }
        // Macs use cmd instead of ctrl
        if (e.metaKey && e.key === 's') {
            e.preventDefault();
            dlJSON();
        }
    });
})();