/* global abilityScoreNames, skillNamesByAbility, alignments, abbreviations */
if (typeof abilityScoreNames === 'undefined') {
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

    // eslint-disable-next-line no-unused-vars
    const alignments = Object.freeze([
        'LG', 'NG', 'CG', 
        'LN', 'N',  'CN', 
        'LE', 'NE', 'CE'
    ])
}

// eslint-disable-next-line no-unused-vars
function dndbeyond_json_parse(response) {
    if (!response.success) {
        return false
    }
    
    const chardata = response.data
    window.dndb_data = chardata
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
        alignment: alignments[chardata.alignmentId],
        class: null, //assigned later
        classlist: [], //assigned later
        level: 0, //assigned later
        skills: {},
        saves: {},
        initiative: 0, //assigned later
        baseHitPoints: chardata.baseHitPoints,
        //bonusHitPoints: chardata.bonusHitPoints,
        //overrideHitPoints: chardata.overrideHitPoints,
        //removedHitPoints: chardata.removedHitPoints,
        temporaryHitPoints: chardata.temporaryHitPoints,
        proficiencyBonus: 0, //assigned later
        proficiencies: {skills:[], saves:[], other:[]},
        expertise: {skills:[], saves:[], other:[]},
        halfProf: false, //assigned later
        spells: [[], [], [], [], [], [], [], [], [], []],
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
    if (modifiers.size) {
        character.size = modifiers.size.at(-1).subType
    }

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
            let subclass = jclass.subclass
            if (typeof abbreviations !== 'undefined') {
                console.log(abbreviations)
                for (const [full, abbr] of Object.entries(abbreviations.subclass)) {
                    subclass = subclass.replace(full, abbr)
                }
            }
            character.class += "(" + subclass + ")"
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
        [].concat(...Object.values(skillNamesByAbility)).map(s => s.toLowerCase().replace(/ /g, "-"))
    )
    //console.log(skillNamesLower)
    // Proficiencies
    for (const prof of modifiers.proficiency || []) {
        const subType = prof.subType
        if (skillNamesLower.has(subType)) {
            character.proficiencies.skills.push(subType)
        }
        else if (subType.endsWith("-saving-throws")) {
            const saveType = subType.replace("-saving-throws","")
            character.proficiencies.saves.push(saveType)
        } else {
            character.proficiencies.other.push(prof.friendlySubtypeName)
        }
    }
    // Expertise
    for (const mod of modifiers.expertise || []) {
        const subType = mod.subType
        if (skillNamesLower.has(subType)) {
            character.expertise.skills.push(subType)
        }
        else if (subType.endsWith("-saving-throws")) {
            // Saves can't usually be expertised, but just in case
            const saveType = subType.replace("-saving-throws","")
            character.expertise.saves.push(saveType)
        } else {
            character.expertise.other.push(mod.friendlySubtypeName)
        }
    }
    // Half Proficiency
    for (const mod of modifiers['half-proficiency'] || []) {
        // Jack of All Trades gives half proficiency to "ability-checks"
        if (mod.subType == "ability-checks") {
            character.halfProf = true
        }
    }

    // Skills
    // Start with ability modifiers
    for (const ability of abilityScoreNames) {
        const mod = Math.floor((character.abilityScores[ability]-10)/2)
        for (const skill of skillNamesByAbility[ability]) {
            character.skills[skill] = mod;
            const skillLower = skill.toLowerCase().replace(/ /g, "-")
            // add PB
            if (character.proficiencies.skills.includes(skillLower)) {
                character.skills[skill] += character.proficiencyBonus
                // add PB again if expertise
                if (character.expertise.skills.includes(skillLower)) {
                    character.skills[skill] += character.proficiencyBonus
                }
            } else if (character.halfProf) {
                character.skills[skill] += Math.floor(character.proficiencyBonus/2)
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

    // Initiative bonus
    character.initiative = Math.floor((character.abilityScores.Dexterity-10)/2)
    if (character.halfProf) {
        character.initiative += Math.floor(character.proficiencyBonus/2)
    }

    // Spells
    character.dndb_spells = {}
    const parseSpell = (spelldata, source) => {
        const name = spelldata.definition.name;
        const level = spelldata.definition.level
        character.dndb_spells[name] = spelldata
        const spellobj = {
            name: name, 
            level: level,
            source: source,
            school: spelldata.definition.school,
            duration: null,
            range: null,
            area: null,
            isConcentration: spelldata.definition.concentration,
            isRitual: spelldata.definition.ritual,
            description: spelldata.definition.description,
            dndb_data: spelldata
        }
        const dndb_dur = spelldata.definition.duration
        if (dndb_dur.durationType == "Instantaneous") {
            spellobj.duration = "Instantaneous"
        } else if (dndb_dur.durationType == "Time" || dndb_dur.durationType == "Concentration") {
            spellobj.duration = dndb_dur.durationInterval + " " + dndb_dur.durationUnit
            if (dndb_dur.durationInterval != 1) {
                spellobj.duration += "s"
            }
            if (dndb_dur.durationType == "Concentration") {
                spellobj.duration += " (C)"
            }
        }

        const dndb_range = spelldata.definition.range
        if (dndb_range.origin == "Touch" || dndb_range.origin == "Self") {
            spellobj.range = dndb_range.origin
        } else if (dndb_range.origin == "Ranged") {
            spellobj.range = dndb_range.rangeValue + " ft"
        }
        if (dndb_range.aoeType != null) {
            spellobj.area = dndb_range.aoeValue + " ft " + dndb_range.aoeType
        }
        console.log({name: name, dndb_dur: dndb_dur, duration: spellobj.duration, isConcentration: spellobj.isConcentration, dnbd_range: dndb_range, range: spellobj.range, area: spellobj.area})

        //console.log(Object.entries(spellobj).filter(([k,v]) => v != null && k != "dndb_data").map(kv => kv[1]).join())
        return spellobj
    }
    for (const [classnum, spellclass] of Object.entries(character.dndb_data.classSpells)) {
        for (const spelldata of spellclass.spells) {
            const source = character.classlist[classnum]
            const spellobj = parseSpell(spelldata, source)
            try {
                character.spells[spellobj.level].push(spellobj)
            } catch {
                console.error(spellobj)
            }
        }
    }
    for (const [source, spellsFromSource] of Object.entries(character.dndb_data.spells)) {
        for (const spelldata of (spellsFromSource || [])) {
            const spellobj = parseSpell(spelldata, source)
            try {
                character.spells[spellobj.level].push(spellobj)
            } catch {
                console.error(spellobj)
            }
        }
    }

    // Export
    window.character = character
    console.log(character)
    return character
}

// eslint-disable-next-line no-unused-vars
function abilityScoreToMod(score) {
    return Math.floor((score-10)/2)
}