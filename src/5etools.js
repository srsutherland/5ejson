function export_5etools (chardata, settings) {
    const creature = {
        name: chardata.name,
        source: "5ejson",
        size: chardata.size || "M",
        type: chardata.race || "humanoid",
        alignment: chardata.alignment?.split(''),
        ac: chardata.ac,
        hp: {
            formula: chardata.hitDice + " + " + chardata.abilityMods.Constitution * chardata.level,
            average: chardata.hp,
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
        
    };

    const out = {
        monster: [creature],
    }
    return out;
}

export { export_5etools };