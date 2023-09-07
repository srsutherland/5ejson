function export_5etools (chardata, settings) {
    const creature = {
        name: chardata.name,
        source: "5ejson",
        size: chardata.size || "M",
        type: {
            type: "humanoid",
            tags: [
                (chardata.race || "PC"),
            ]
        },
        alignment: chardata.alignment?.split(''),
        ac: [
            chardata.armorClass, // This might be overridden by more specific ACs below
        ],
        hp: {
            average: chardata.maxHP, // Actual value, but it's labeled "average" in 5etools
            formula: chardata.hitDice + " + " + chardata.abilityMods.Constitution * chardata.level,
        },
        speed: {
            walk: chardata.speed,
        },
        str: chardata.abilityScores.Strength,
        dex: chardata.abilityScores.Dexterity,
        con: chardata.abilityScores.Constitution,
        int: chardata.abilityScores.Intelligence,
        wis: chardata.abilityScores.Wisdom,
        cha: chardata.abilityScores.Charisma,
        save: {},
        skill: {},
        passive: chardata.skills.Perception + 10,
        
    };

    // Saves
    // Only add saves if they are different than the ability score modifier
    for (const [attribute, value] of Object.entries(chardata.saves)) {
        if (value != chardata.abilityMods[attribute]) {
            // Strength -> str
            const attr_5et = attribute.toLowerCase().slice(0, 3);
            creature.save[attr_5et] = value;
        }
    }

    // Skills
    // Only add skills if they are different than the ability score modifier
    for (const [attribute, skills] of Object.entries(skillNamesByAbility)) {
        for (const skill of skills) {
            const value = chardata.skills[skill];
            if (value != chardata.abilityMods[attribute]) {
                creature.skill[skill.toLowerCase()] = value;
            }
        }
    }

    // Spells
    const spells = {};
    const ritual_spells = [];
    for (const [lvl, spells_at_lvl] of Object.entries(chardata.spells)) {
        // if spells is not empty
        const spell_list = [];
        const ritual_spell_list = [];
        for (const spell of spells_at_lvl) {
            let spell_name = spell.name.toLowerCase();
            if (spell_name.startsWith("[r] ") || spell.ritualOnly) {
                spell_name = spell_name.slice(4);
                ritual_spell_list.push(`{@spell ${spell_name}}`);
            } else {
                spell_list.push(`{@spell ${spell_name}}`);
            }
            
        }
        if (spell_list.length > 0) {
            spells[lvl] = {
                slots: chardata.spellSlots[lvl],
                spells: spell_list
            };
        }
        if (ritual_spell_list.length > 0) {
            ritual_spells[lvl] = {
                // No slots for ritual spells
                spells: ritual_spell_list
            }
        }
    }
    if (Object.keys(spells).length > 0) {
        const caster_level = chardata.classlist[0].level;
        // 1 -> 1st, 2 -> 2nd, etc.
        const caster_level_str = 
            (["1st", "2nd", "3rd"])[caster_level - 1] || 
            caster_level + "th";
        creature.spellcasting = [{
			name: "Spellcasting",
			headerEntries: [
				`${chardata.name} is a ${caster_level_str}-level ${chardata.classlist[0].name}. ` +
                `Their spellcasting ability is ${chardata.spellcasting.ability} ` +
                `(spell save {@dc ${chardata.spellcasting.dc}}, ` +
                `{@hit ${chardata.spellcasting.bonus}} to hit with spell attacks). `, 
                `${chardata.name} has the following ${chardata.classlist[0].name} spells prepared:`
			],
            spells: spells,
        }];
    }
    if (Object.keys(ritual_spells).length > 0) {
        creature.spellcasting = creature.spellcasting || [];
        creature.spellcasting.push({
            name: "Spellcasting (Rituals)",
            headerEntries: [
                `${chardata.name} can cast the following spells as rituals. ` +
                `The ritual version of a spell takes 10 minutes longer to cast than normal.`
            ],
            spells: ritual_spells,
        })
    }
    

    const out = {
        _meta: {
            sources: [
                {
                    "json": "5ejson",
                    "abbreviation": "5ejson",
                    "full": "5eJSON Character Export",
                    "url": "https://srsutherland.github.io/5ejson",
                    "authors": [],
                    "convertedBy": [],
                    "version": "1.0.0"
                }
            ],
            dateAdded: Date.now(),
            dateLastModified: Date.now(),
        },
        monster: [creature],
    }
    return out;
}

export { export_5etools };