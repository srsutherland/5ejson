<script setup>
import { defineProps } from 'vue'

import { abilityScoreNames, skillNamesByAbility } from '../../../src/constants.js'

const utfDots = {
    circleOpen:  "◌",
    circleFull:  "●",
    circleExtra: "☀",
    circleHalf:  "○",
    diamondOpen: "◇",
    diamondFull: "◈",
}

const modString = (mod) => (mod < 0 ? "" : "+") + mod
const getMod = (score) => Math.floor((score-10)/2)

const saveDot = (char, ability) => {
    const hasSaveProf = char.proficiencies?.saves.includes(ability.toLowerCase())
    return hasSaveProf ? utfDots.diamondFull : utfDots.diamondOpen
}

const skillDot = (char, skillName) => {
    const profKey = skillName.toLowerCase().replace(/ /g, "-")
    const hasSkillProf = char.proficiencies?.skills.includes(profKey)
    const hasExpertise = char.expertise?.skills.includes(profKey)
    return hasSkillProf ? 
        (hasExpertise ? utfDots.circleExtra : utfDots.circleFull) : 
        (char.halfProf ? utfDots.circleHalf : utfDots.circleOpen)
}

const props = defineProps({
    char: Object
})
</script>

<template>
  <table id="abilityscores">
    <tr class="ast_name">
      <th v-for="ability in abilityScoreNames" :key="ability">
        {{ ability }}
      </th>
    </tr>
    <tr class="ast_score">
      <td v-for="ability in abilityScoreNames" :key="ability">
        {{ props.char.abilityScores[ability] }}
      </td>
    </tr>
    <tr class="ast_mod">
      <td v-for="ability in abilityScoreNames" :key="ability">
        {{ modString(getMod(props.char.abilityScores[ability])) }}
      </td>
    </tr>
    <tr class="ast_skills">
      <td v-for="ability in abilityScoreNames" :key="ability">
        <div>
          {{ saveDot(props.char, ability) }}
          Saves: 
          {{ modString(props.char.saves[ability]) }}
        </div>
        <div v-for="skillName in skillNamesByAbility[ability]" :key="skillName">
          {{ skillDot(props.char, skillName) }}
          {{ skillName }}: 
          {{ modString(props.char.skills[skillName]) }}
        </div>
      </td>
    </tr>
  </table>
</template>