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