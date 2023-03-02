// eslint-disable-next-line no-unused-vars
const abilityScoreNames = Object.freeze([
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma"
])

// eslint-disable-next-line no-unused-vars
const skillNamesByAbility = Object.freeze({
    "Strength": [
        "Athletics"
    ],
    "Dexterity": [
        "Acrobatics",
        "Sleight of Hand",
        "Stealth"
    ],
    "Constitution": [],
    "Intelligence": [
        "Arcana",
        "History",
        "Investigation",
        "Nature",
        "Religion"
    ],
    "Wisdom": [
        "Animal Handling",
        "Insight",
        "Medicine",
        "Perception",
        "Survival"
    ],
    "Charisma": [
        "Deception",
        "Intimidation",
        "Performance",
        "Persuasion"
    ]
})

const alignments = Object.freeze([
    'LG', 'NG', 'CG', 
    'LN', 'N',  'CN', 
    'LE', 'NE', 'CE'
])

// eslint-disable-next-line no-unused-vars
function dndbeyond_json_parse(response) {
    if (!response.success) {
        return false
    }
    
    const chardata = response.data
    let character = {
        dndb_data: chardata,
        name: chardata.name,
        description: {
            gender:	chardata.gender,
            faith: chardata.faith,
            age: chardata.age,
            hair: chardata.hair,
            eyes: chardata.eyes,
            skin: chardata.skin,
            height: chardata.height,
            weight: chardata.weight,
        },
        abilityScores: {array: []}, //assigned later
        race: chardata.race.fullName,
        size: chardata.race.size,
        background: chardata.background.definition.name,
        class: null, //assigned later
        classlist: [], //assigned later
        level: 0, //assigned later
        skills: {},
        saves: {},
        alignment: alignments[chardata.alignmentId],
        baseHitPoints: chardata.baseHitPoints,
        //bonusHitPoints: chardata.bonusHitPoints,
        //overrideHitPoints: chardata.overrideHitPoints,
        //removedHitPoints: chardata.removedHitPoints,
        temporaryHitPoints: chardata.temporaryHitPoints,
        proficiencies: {skills:[], saves:[], other:[]},
        proficiencyBonus: 0, //assigned later
    }
    // Restructure modifier data
    const modifiers = {}
    for (const [modSource, modList] of Object.entries(chardata.modifiers)) {
        for (const mod of modList) {
            const type = mod.type
            if (modifiers[type] == undefined) {
                modifiers[type] = []
            }
            modifiers[type].push({modSource: modSource, ...mod})
        }
    }
    character.dndb_modifiers = modifiers

    //Calc total level for PB
    character.proficiencyBonus = 10
    for (const dndbclass of character.dndb_data.classes) {
        const jclass = {}
        jclass.name = dndbclass.definition.name
        jclass.level = dndbclass.level
        jclass.subclass = dndbclass.subclassDefinition?.name
        jclass.isStartingClass = dndbclass.isStartingClass

        character.level += jclass.level
        
        // Class string
        if (character.class == null) {
            character.class = ""
        } else {
            character.class += " / "
        }
        character.class += jclass.name
        if (jclass.subclass) {
            character.class += "(" + jclass.subclass + ")"
        }
        character.class += " " + jclass.level

        character.classlist.push(jclass)
    }
    character.proficiencyBonus = Math.floor(character.level/4) + 2

    // Ability Scores
    // Only the base scores, need to add bonuses below.
    const scores = character.abilityScores
    for (const a of chardata.stats) {
        const i = a.id - 1 //1-indexed, 1-6
        scores.array[i] = a.value
    }
    for (let i = 0; i < 6; i++) {
        scores[abilityScoreNames[i]] = scores.array[i]
    }
    // Okay now add in all of the modifiers
    const bonusAbilityScoreMap = new Map(
        abilityScoreNames.map(a => [a.toLowerCase() + "-score", a])
    )
    for (const mod of modifiers.bonus || []) {
        if (bonusAbilityScoreMap.has(mod.subType)) {
            const statName = bonusAbilityScoreMap.get(mod.subType)
            const value = mod.value || mod.fixedValue
            character.abilityScores[statName] += value
            character.abilityScores.array[mod.entityId - 1] += value
        }
    }
    
    const skillNamesLower = new Set(
        [].concat(...Object.values(skillNamesByAbility)).map(s => s.toLowerCase())
    )
    console.log(skillNamesLower)
    for (const mod of modifiers.proficiency) {
        const subType = mod.subType
        if (skillNamesLower.has(subType)) {
            character.proficiencies.skills.push(subType)
        }
        if (subType.endsWith("-saving-throws")) {
            const saveType = subType.replace("-saving-throws","")
            character.proficiencies.saves.push(saveType)
        }
    }

    // Skills
    // Start with ability modifiers
    for (const ability of abilityScoreNames) {
        const mod = Math.floor((character.abilityScores[ability]-10)/2)
        for (const skill of skillNamesByAbility[ability]) {
            character.skills[skill] = mod;
            // add PB
            if (character.proficiencies.skills.includes(skill.toLowerCase())) {
                character.skills[skill] += character.proficiencyBonus
            }
        }
    }

    // Saves
    // Start with ability modifiers
    for (const ability of abilityScoreNames) {
        const mod = Math.floor((character.abilityScores[ability]-10)/2)
        character.saves[ability] = mod;
        // add PB
        if (character.proficiencies.saves.includes(ability.toLowerCase())) {
            character.saves[ability] += character.proficiencyBonus
        }
    }

    window.character = character
    console.log(character)
    return character
}

// eslint-disable-next-line no-unused-vars
function abilityScoreToMod(score) {
    return Math.floor((score-10)/2)
}