// ==UserScript==
// @name         Roll20 JSON Downloader
// @namespace    dragonfang.tech
// @version      2023.08.15
// @description  Download Roll20 character sheet as JSON file with ctrl+s
// @author       srsutherland
// @license      MIT
// @match        https://app.roll20.net/editor/
// @match        https://app.roll20.net/editor/character/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=roll20.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var formatCharacterData = (char) => {
        const formatted = {};
        const formatModelAttributes = (attributes) => {
            return {
                name: attributes.name,
                current: attributes.current,
                max: attributes.max,
                id: attributes.id,   
            }
        }
        formatted.attributes = {
            name: char.attributes.name,
            avatar: char.attributes.avatar,
            bio: char.attributes.bio,
            gmnotes: char.attributes.gmnotes,
        }
        formatted.attribs = {
            length: char.attribs.length,
            models: char.attribs.models.map(m => {
                return {
                    attributes: formatModelAttributes(m.attributes),
                    cid: m.cid,
                    id: m.id,
                }
            }),
        }
        return formatted;
    };

    // Attempt to load the character data
    var getCharacterData = (popup=false) => {
        const charid = window.d20?.characterId;
        if (!charid) {
            if (popup) {
                alert("Could not obtain character ID. Are you on a Roll20 character sheet?");
            }
            console.error("<code>`d20?.characterId`</code> was null. Are you on a Roll20 character sheet iframe?");
            return charid;
        }
        const chardata = parent.Campaign.characters.get(charid);
        return formatCharacterData(chardata);
    }
    
    const downloadAsJSON = (data, filename) => {
        const illegalChars = /[\/\?<>\\:\*\|" ]/g;
        const content = JSON.stringify(data, null, 2);
        const exportName = filename.replaceAll(illegalChars, "_");
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    // Download the sheet as JSON
    const dlCharSheet = () => {
        const char = getCharacterData(true);
        if (!char) {
            return;
        }
        const charname = char.attributes.name;
        const charclass = 
            char.attribs.models.find(m => m.attributes.name === "class").attributes.current +
            char.attribs.models.find(m => m.attributes.name === "level").attributes.current;
        
        const filename = `${charclass}_${charname}.roll20.json`;
        downloadAsJSON(char, filename);
    };

    // Download on ctrl++s
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            dlCharSheet();
        }
        // Macs use cmd instead of ctrl
        if (e.metaKey && e.key === 's') {
            e.preventDefault();
            dlCharSheet();
        }
    });
})();
