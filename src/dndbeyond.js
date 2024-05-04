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
        abilityMods: {array: []}, //assigned later
        race: chardata.race.fullName,
        size: chardata.race.size,
        background: chardata.background.definition.name,
        alignment: alignments[chardata.alignmentId-1], // 1-indexed
        class: null, //assigned later
        classlist: [], //assigned later
        hitDice: null, //assigned later
        level: 0, //assigned later
        skills: {},
        saves: {},
        initiative: 0, //assigned later
        baseHP: chardata.baseHitPoints, //without con mod
        bonusHitPoints: chardata.bonusHitPoints, //from feats, etc
        //overrideHitPoints: chardata.overrideHitPoints,
        //removedHitPoints: chardata.removedHitPoints,
        tempHP: chardata.temporaryHitPoints,
        maxHP: chardata.baseHitPoints + chardata.bonusHitPoints, //con mod added later
        speed: 0, //assigned later
        speeds: {},
        senses: {},
        proficiencyBonus: 0, //assigned later
        proficiencies: {skills:[], saves:[], other:[]},
        expertise: {skills:[], saves:[], other:[]},
        halfProf: false, //assigned later
        languages: [],
        spells: [[], [], [], [], [], [], [], [], [], []],
        spellSlots: [undefined, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        spellcasting: [],
        notes: chardata.notes,
    }
    const rawModifiers = chardata.modifiers
    // Before we can start we need to get the modifiers from items
    rawModifiers.item = []
    const itemsWhichGrantModifiers = chardata.inventory.filter(i => i.definition.grantedModifiers.length)
    for (const item of itemsWhichGrantModifiers) {
        for (const mod of item.definition.grantedModifiers) {
            if (mod.isGranted && (mod.requiresAttunement == false || item.isAttuned)) {
                rawModifiers.item.push({item: item.definition.name, ...mod})
            }
        }
    }
    // Get the value from the many ways it can be stored
    const getModValue = (mod) => {
        const value = 
            mod.value || 
            mod.fixedValue || 
            character.abilityMods.array[mod.statId-1] ||
            [NaN, character.proficiencyBonus][mod.bonusTypes[0]] ||
            0;
        return value
    }


    // Restructure modifier data
    const modifiers = {}
    for (const [modSource, modList] of Object.entries(rawModifiers)) {
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
    for (const dndbclass of character.dndb_data.classes) {
        const jclass = {}
        jclass.name = dndbclass.definition.name
        jclass.level = dndbclass.level
        jclass.subclass = dndbclass.subclassDefinition?.name
        jclass.hitDice = "d" + dndbclass.definition.hitDice
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
    character.hitDice = character.classlist.map(c => c.level + c.hitDice).join("+")
    // Proficiency Bonus starts at +2 at level 1, and increases every 4 levels
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
    // Now calculate the modifiers from the scores
    const mods = character.abilityMods
    for (let i = 0; i < 6; i++) {
        mods.array[i] = Math.floor((scores.array[i] - 10) / 2)
        mods[abilityScoreNames[i]] = mods.array[i]
    }
    // add con mod bonus to hp
    character.maxHP += Math.floor((character.abilityScores.Constitution-10)/2) * character.level
    
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

    // Languages
    for (const mod of modifiers.language || []) {
        character.languages.push(mod.friendlySubtypeName)
    }
    // Move Common to the front
    const commonIndex = character.languages.indexOf("Common")
    if (commonIndex > 0) {
        character.languages.splice(commonIndex, 1)
        character.languages.unshift("Common")
    }

    // Skills
    // Start with ability modifiers
    for (const ability of abilityScoreNames) {
        const mod = character.abilityMods[ability]
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
            // Check misc bonuses
            for (const mod of modifiers.bonus || []) {
                if (mod.subType == skillLower || mod.subType == "ability-checks") {
                    const value = getModValue(mod);
                    character.skills[skill] += value;
                }
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
        // Misc bonuses
        for (const mod of modifiers.bonus || []) {
            if (mod.subType == ability.toLowerCase() + "-saves" || mod.subType == "saving-throws") {
                const value = getModValue(mod)
                character.saves[ability] += value;
            }
        }
    }

    // Initiative bonus
    character.initiative = character.abilityMods.Dexterity
    if (character.halfProf) {
        character.initiative += Math.floor(character.proficiencyBonus/2)
    }
    for (const mod of modifiers.bonus || []) {
        if (mod.subType == "initiative" || mod.subType == "ability-checks") {
            const value = getModValue(mod)
            character.initiative += value;
        }
    }

    // Spellcasting
    const classSpellcastingAbilities = {
        "Bard": "Charisma",
        "Cleric": "Wisdom",
        "Druid": "Wisdom",
        "Paladin": "Charisma",
        "Ranger": "Wisdom",
        "Sorcerer": "Charisma",
        "Warlock": "Charisma",
        "Wizard": "Intelligence"
    }
    for (const jclass of character.classlist) {
        const spellcastingAbility = classSpellcastingAbilities[jclass.name]
        if (spellcastingAbility) {
            const classSpellcasting = {
                name: jclass.name,
                ability: spellcastingAbility,
                dc: 8 + character.abilityMods[spellcastingAbility] + character.proficiencyBonus,
                attack: character.abilityMods[spellcastingAbility] + character.proficiencyBonus,
            }
            character.spellcasting.push(classSpellcasting)
        }
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
        
        // Duration
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

        // Range and Area
        const dndb_range = spelldata.definition.range
        if (dndb_range.origin == "Touch" || dndb_range.origin == "Self") {
            spellobj.range = dndb_range.origin
        } else if (dndb_range.origin == "Ranged") {
            spellobj.range = dndb_range.rangeValue + " ft"
        }
        if (dndb_range.aoeType != null) {
            spellobj.area = dndb_range.aoeValue + " ft " + dndb_range.aoeType
        }

        // Casting Time
        const dndb_castingTime = spelldata.definition.activation
        const castingTimeTypes = [null, "Action", "Type2", "Bonus Action", "Reaction", "Type5", "Minute", "Hour", "Special"]
        const castingTimeUnit = {
            value: castingTimeTypes[dndb_castingTime.activationType],
            IsAction: dndb_castingTime.activationType > 0 && dndb_castingTime.activationType < 5,
            IsSpecial: dndb_castingTime.activationType == 8,
            IsTime: dndb_castingTime.activationType > 4 && dndb_castingTime.activationType < 8
        }
        if (castingTimeUnit.IsAction || castingTimeUnit.IsSpecial) {
            spellobj.castingTime = castingTimeUnit.value
        } else if (castingTimeUnit.IsTime) {
            spellobj.castingTime = dndb_castingTime.activationTime + " " + castingTimeUnit.value
        } else {
            spellobj.castingTime = dndb_castingTime.activationTime + " of Unknown Type"; 
        }

        // Components (V, S, M)
        const componentMap = ["_", "V", "S", "M"]
        spellobj.components = spelldata.definition.components.map(c => componentMap[c]).join("")

        // Damage
        if (spelldata.definition.tags.includes("Damage")) {
            const modifiers = spelldata.definition.modifiers
            const damageMods = modifiers.filter(mod => mod.type == "damage").map(mod => {
                const damage = {dice: mod.die.diceString, type: mod.subType}
                if (spellobj.level == 0) {
                    for (const lvlDef of mod.atHigherLevels.higherLevelDefinitions) {
                        if (character.level >= lvlDef.level) {
                            damage.dice = lvlDef.dice.diceString
                        }
                    }
                }
                return damage
            })

            spellobj.damage = damageMods.map(mod => mod.dice + " " + mod.type).join(", ")
            // Needs special handling for Eldritch Blast
        }

        // TODO: REMOVE
        character.dndb_spells[name]._parsed = spellobj
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
    console.log(character.dndb_spells)

    // Equipment
    character.dndb_inventory = {}
    for (const item of character.dndb_data.inventory) {
        const name = item.definition.name
        if (character.dndb_inventory[name] != null) {
            character.dndb_inventory[name].quantity += item.quantity
        } else {
            character.dndb_inventory[name] = item
        }
        // TODO: format items and add to character.inventory
    }

    // Armor Class
    const armorClasses = []
    const armorBonuses = []
    const notEquipped = []
    // This is surprisingly complicated
    // First 10 + Dex
    armorClasses.push({
        name: "Unarmored", type: "unarmored", isArmor: false,
        components: [
            {name: "Base", value: 10},
            {name: "Dex", value: character.abilityMods.Dexterity}
        ], ac: (10 + character.abilityMods.Dexterity)
    })
    const itemsWhichAreArmor = character.dndb_data.inventory.filter(item => item.definition.filterType == "Armor")
    const itemsWhichGiveAC = character.dndb_data.inventory.filter(item => item.definition.armorClass != null)
    // Turn each armor or shield into an AC object and append to armorClasses
    for (const armor of itemsWhichAreArmor) {
        const def = armor.definition
        const name = def.name
        const ac = def.armorClass
        const components = [{name: "Base", value: ac}]
        let type = null
        if (def.armorTypeId == 1) {
            // Light armor
            components.push({name: "Dex", value: character.abilityMods.Dexterity})
            type = "light"
        } else if (def.armorTypeId == 2) {
            // Medium armor
            components.push({name: "DexMax2", value: Math.min(character.abilityMods.Dexterity, 2)})
            type = "medium"
        } else if (def.armorTypeId == 3) {
            // Heavy armor
            type = "heavy"
        } else if (def.armorTypeId == 4) {
            // Shield
            type = "shield"
        }
        const totalAC = Object.values(components).reduce((acc, cur) => acc + cur.value, 0)
        const armorObj = {name: name, type: type, isArmor: true, components: components, ac: totalAC, equipped: armor.equipped}
        if (armor.equipped) {
            if (armorObj.type == "shield") {
                armorBonuses.push(armorObj)
            } else {
                armorClasses.push(armorObj)
            }
        } else {
            notEquipped.push(armorObj)
        }
        // Remove from itemsWhichGiveAC
        itemsWhichGiveAC.splice(itemsWhichGiveAC.indexOf(armor), 1)
    }
    // Turn each set-modifier (unarmored defense) into an AC object and append to armorClasses
    for (const mod of character.dndb_modifiers.set) {
        if (mod.subType === "unarmored-armor-class") {
            const statName = abilityScoreNames[mod.statId-1]
            const statValue = character.abilityMods[statName]
            const statShortName = statName.substring(0, 3)
            const components = [
                {name: "Base", value: 10},
                {name: "Dex", value: character.abilityMods.Dexterity},
                {name: statShortName, value: statValue}
            ]
            const ac = {
                name: "Unarmored +" + statShortName, type: "unarmored", isArmor: false, 
                components: components,
                ac: Object.values(components).reduce((acc, cur) => acc + cur.value, 0)
            }
            armorClasses.push(ac)
        }
    }
    // Turn each bonus-modifier into an AC object and append to armorBonuses
    for (const mod of character.dndb_modifiers.bonus) {
        if (mod.subType === "armored-armor-class") {
            const ac = {
                name: "Armored bonus", type: "armored", isArmor: false,
                components: [{name: "Bonus", value: mod.value}],
                ac: mod.value
            }
            armorBonuses.push(ac)
        } else if (mod.subType === "unarmored-armor-class") { //TODO check
            const ac = {
                name: "Unarmored bonus", type: "unarmored", isArmor: false,
                components: [{name: "Bonus", value: mod.value}],
                ac: mod.value
            }
            armorBonuses.push(ac)
        } else if (mod.subType === "armor-class") { //TODO check
            const ac = {
                name: mod.item ?? "Armor class", 
                type: "bonus", isArmor: false,
                components: [{name: "Bonus", value: mod.value}],
                ac: mod.value
            }
            armorBonuses.push(ac)
        }
    }
    character.armorCalculation = {
        armorClasses: armorClasses,
        armorBonuses: armorBonuses,
        notEquipped: notEquipped,
        itemsWhichGiveAC: itemsWhichGiveAC
    }
    character.armorClassSource = armorClasses[0]
    character.armorClass = character.armorClassSource.ac
    for (const armorClass of armorClasses) {
        const combination = [armorClass]
        for (const armorBonus of armorBonuses) {
            if (armorBonus.type == "shield") {
                // Can only have one shield, choose the best one
                if (combination.some(armor => armor.type == "shield")) {
                    if (armorBonus.ac > combination.find(armor => armor.type == "shield").ac) {
                        combination.splice(combination.indexOf(armorBonus), 1)
                        combination.push(armorBonus)
                    }
                } else {
                    combination.push(armorBonus)
                }
            } else if (armorBonus.type == "armored") {
                if (armorClass.isArmor) {
                    combination.push(armorBonus)
                }
            } else if (armorBonus.type == "unarmored") {
                if (!armorClass.isArmor) {
                    combination.push(armorBonus)
                }
            } else if (armorBonus.type == armorClass.type) {
                combination.push(armorBonus)
            } else if (armorBonus.type == "bonus") {
                combination.push(armorBonus)
            }
        }
        const totalAC = combination.reduce((acc, cur) => acc + cur.ac, 0)
        if (totalAC > character.armorClass) {
            character.armorClassSource = armorClass
            character.armorClassComponents = combination
            character.armorClass = totalAC
        }
    }
        
    // Speed(s)
    // walking, swimming, climbing, flying, burrowing
    character.speeds.walk = 30 // This is the default speed, only change if there is a speed modifier
    const speedTypes = ["walking", "swimming", "climbing", "flying", "burrowing"]
    const shortSpeedTypes = ["walk", "swim", "climb", "fly", "burrow"] // I'd truncate if not for "swimm"
    // Walking speed first, since some speeds are based on walking speed
    for (const mod of character.dndb_modifiers.set || []) {
        if (mod.subType === "innate-speed-walking") {
            character.speeds.walk = Math.max(mod.value, character.speeds.walk)
        }
    }
    for (const mod of character.dndb_modifiers.bonus || []) {
        if (mod.subType === "unarmored-movement") {
            character.speeds.walk += mod.value
        }
    }
    for (const mod of character.dndb_modifiers.set || []) {
        if (mod.subType.match("innate-speed-") && mod.subType !== "innate-speed-walking") {
            const speedType = mod.subType.substring("innate-speed-".length)
            const shortType = shortSpeedTypes[speedTypes.indexOf(speedType)]
            // Speeds which are based on walking speed have no mod.value
            const speed = mod.value ?? character.speeds.walk
            character.speeds[shortType] = Math.max(speed, character.speeds[shortType] ?? 0)
        }
    }
    for (const mod of character.dndb_modifiers.bonus || []) {
        // This subType is a guess, I don't have a character with this modifier
        if (mod.subType.match("speed-") && mod.subType !== "innate-speed-walking") {
            const speedType = mod.subType.substring("innate-speed-".length)
            const shortSpeedType = shortSpeedTypes[speedTypes.indexOf(speedType)]
            const bonus = mod.value || mod.fixedValue;
            character.speeds[shortSpeedType] += bonus
        }
    }
    character.speed = character.speeds.walk

    // Senses
    for (const mod of character.dndb_modifiers['set-base'] || []) {
        if (mod.subType === "darkvision") {
            if (!character.senses.darkvision || mod.value > character.senses.darkvision) {
                character.senses.darkvision = mod.value
            }
        }
    }
    for (const mod of character.dndb_modifiers.bonus || []) {
        if (mod.subType === "darkvision") {
            if (!character.senses.darkvision || mod.value > character.senses.darkvision) {
                character.senses.darkvision += mod.value
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