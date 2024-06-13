<script setup>
// eslint-disable-next-line no-unused-vars
const utfDots = {
    circleOpen:  "◌",
    circleFull:  "●",
    circleExtra: "☀",
    circleHalf:  "○",
    diamondOpen: "◇",
    diamondFull: "◈",
}
</script>

<!--
//// Ability Scores ////
const ASTable = document.getElementById("abilityscores")
ASTable.innerHTML = ""
const ASRows = ["ast_name", "ast_score", "ast_mod", "ast_skills"]
// Set up rows (as named above)
for (let i = 0; i < 4; i++) {
    const as_htmclass = ASRows[i]
    ASRows[i] = document.createElement("tr")
    if (as_htmclass && typeof as_htmclass == 'string') {
        ASRows[i].classList.add(as_htmclass)
    }
    ASTable.insertAdjacentElement("beforeend", ASRows[i])
}
// Fill in each Ability Score column
for (const ability of abilityScoreNames) {
    // Name
    ASRows[0].insertAdjacentHTML("beforeend", `<th>${ability}</th>`)
    // Score
    const score = character.abilityScores[ability]
    ASRows[1].insertAdjacentHTML("beforeend", `<td>${score}</td>`)
    // Mod
    const mod = Math.floor((score-10)/2)
    ASRows[2].insertAdjacentHTML("beforeend", `<td>${modString(mod)}</td>`)
    // Skills + Saves + etc
    const hasSaveProf = char.proficiencies?.saves.includes(ability.toLowerCase())
    const saveDot = hasSaveProf ? utfDiamondFull : utfDiamondOpen
    let skillBox = `<div>${saveDot} Saves: ${modString(character.saves[ability])}</div>`
    for (const skillName of skillNamesByAbility[ability]) {
        const skillMod = character.skills[skillName]
        const profKey = skillName.toLowerCase().replace(/ /g, "-")
        const hasSkillProf = char.proficiencies?.skills.includes(profKey)
        const hasExpertise = char.expertise?.skills.includes(profKey)
        const skillDot = hasSkillProf ? 
            (hasExpertise ? utfCircleExtra : utfCircleFull) : 
            (char.halfProf ? utfCircleHalf : utfCircleOpen)
        skillBox += `<div>${skillDot} ${skillName}: ${modString(skillMod)}</div>`
    }
    ASRows[3].insertAdjacentHTML("beforeend", `<td>${skillBox}</td>`)
}
-->

<template>
  <table id="abilityscores">
    <tr class="ast_name">
      <th v-for="ability in abilityScoreNames" :key="ability">{{ ability }}</th>
    </tr>
  </table>
</template>