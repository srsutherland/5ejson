<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    char: Object
})

const modString = (mod) => (mod < 0 ? "" : "+") + mod
</script>

<!--
///// Combat /////
const combatContain = document.getElementById("combat")
combatContain.innerHTML = ""

// PB
const pbDiv = document.createElement("div")
pbDiv.classList.add("pb")
//style
pbDiv.style.fontSize = "1.5em"
pbDiv.insertAdjacentText("beforeend", `PB: ${modString(character.proficiencyBonus)}`)
combatContain.insertAdjacentElement("beforeend", pbDiv)

// HP
const hpDiv = document.createElement("div")
hpDiv.classList.add("hp")
//style
hpDiv.style.fontSize = "1.5em"
hpDiv.insertAdjacentText("beforeend", "HP: ")
// Tall text input with Max HP as placeholder, "slash", max HP (maxHP)
const hpInput = document.createElement("input")
hpInput.type = "text"
hpInput.classList.add("hp-input")
hpInput.placeholder = character.maxHP
hpInput.value = character.currentHitPoints || character.maxHP
hpInput.addEventListener("change", () => {
    character.currentHitPoints = hpInput.value
})
//style: width: 2em; text-align: end;
hpInput.style.fontSize = "1em"
hpInput.style.width = "2em"
hpInput.style.textAlign = "end"
hpInput.style.border = "none"
hpInput.style.borderBottom = "1px solid black"
hpInput.style.margin = "-1px -2px"
hpDiv.insertAdjacentElement("beforeend", hpInput)
hpDiv.insertAdjacentText("beforeend", ` / ${character.maxHP}`)
combatContain.insertAdjacentElement("beforeend", hpDiv)

// Initiative
const initDiv = document.createElement("div")
initDiv.classList.add("initiative")
initDiv.style.fontSize = "1.5em"
initDiv.innerText = `Init: ${modString(character.initiative)}`
combatContain.insertAdjacentElement("beforeend", initDiv)

// AC
const acDiv = document.createElement("div")
acDiv.classList.add("ac")
acDiv.style.fontSize = "1.5em"
acDiv.innerText = `AC: ${character.armorClass || character.ac}`
combatContain.insertAdjacentElement("beforeend", acDiv)

// Hit Dice
const hitDiceDiv = document.createElement("div")
hitDiceDiv.classList.add("hitdice")
hitDiceDiv.style.fontSize = "1.5em"
hitDiceDiv.innerText = `Hit Dice: ${character.hitDice}`
combatContain.insertAdjacentElement("beforeend", hitDiceDiv)

// Speed
const speedDiv = document.createElement("div")
speedDiv.classList.add("speed")
speedDiv.style.fontSize = "1.5em"
speedDiv.innerText = `Speed: ${character.speed}`
combatContain.insertAdjacentElement("beforeend", speedDiv)
// Other Speeds (fly, swim, climb, burrow)
for (const [mode, speed] of Object.entries(character.speeds)) {
    if (mode.toLowerCase() == "walk") {
        continue
    }
    if (speed) {
        const speedDiv = document.createElement("div")
        speedDiv.classList.add("speed")
        speedDiv.innerText = `${mode}: ${speed}`
        combatContain.insertAdjacentElement("beforeend", speedDiv)
    }
}
-->

<template>
    <div id="combat">
        <div class="pb bigbox">PB: {{ modString(props.char.proficiencyBonus) }}</div>
        <div class="hp bigbox">
            HP: 
            <input 
                type="text" 
                class="hp-input" 
                :placeholder="props.char.maxHP" 
                :value="props.char.currentHitPoints || props.char.maxHP"
                @change="() => props.char.currentHitPoints = $event.target.value"
            >
            / {{ props.char.maxHP }}
        </div>
        <div class="initiative bigbox">Init: {{ modString(props.char.initiative) }}</div>
        <div class="ac bigbox">AC: {{ props.char.armorClass || props.char.ac }}</div>
        <div class="hitdice bigbox">Hit Dice: {{ props.char.hitDice }}</div>
        <div class="speed bigbox">Speed: {{ props.char.speed }}</div>
        <div 
            v-for="([mode, speed]) in Object.entries(props.char.speeds)"
            v-if="mode?.toLowerCase() != 'walk' && speed"
            :key="mode"
            class="speed bigbox"
        >
            {{ mode }}: {{ speed }}
        </div>
    </div>
</template>

<style scoped>
.bigbox {
    font-size: 1.5em;
}
.hp-input {
    font-size: 1em;
    width: 2em;
    text-align: end;
    border: none;
    border-bottom: 1px solid black;
    margin: -1px -2px;
}
</style>