
const root_attributes_example = {
    "name": "Zag Moondust",
    "avatar": "https://s3.amazonaws.com/files.d20.io/images/329340042/HXoogRP8s4t2OTiMqsVoxg/med.png?1677115262",
    "bio": "",
    "gmnotes": ""
}

const attrib_model_example = {
    "attributes": {
      "name": "intelligence_bonus",
      "current": "-3",
      "max": "",
      "id": "-NaJyjRiKtZzEY2mNT8t"
    },
    "cid": "c6435",
    "id": "-NaJyjRiKtZzEY2mNT8t"
}

function roll20_json_parse(response) {
    const chardata = formatCharacterData(response);
    const simple = Object.fromEntries(
        Object.values(chardata)
        .filter(v => !v.name.match("repeating_"))
        .map(v => [v.name, v.current])
    );
    const repeating = formatRepeating(chardata);
    const character = {
        roll20_data: Object.fromEntries(
            Object.entries(chardata).filter(([k,v]) => !k.match("repeating_"))
        ),
        roll20_data_repeating: Object.fromEntries(
            Object.entries(chardata).filter(([k,v]) => k.match("repeating_"))
        ),
        roll20_data_simple: simple,
        roll20_repeating: repeating,
        name: chardata.name.current,
        description: {
        },
        abilityScores: {array: []}, //assigned later
        abilityMods: {array: []}, //assigned later
        race: simple.racedisplay || simple.race

    }

    // Export
    window.character = character
    console.log(character)
    return character
}

function formatCharacterData(formatted_or_raw_response) {
    const is_unformatted = (
        formatted_or_raw_response.attributes && 
        formatted_or_raw_response.attribs?.models instanceof Array
    )
    if (!is_unformatted) {
        return formatted_or_raw_response
    }
    const raw = formatted_or_raw_response
    const formatted = {
        "name": {
            "name": "name",
            "current": raw.attributes.name,
            "max": "",
            "cid": "c0",
            "id": "name"
        },
        "avatar": {
            "name": "avatar",
            "current": raw.attributes.avatar,
            "max": "",
            "cid": "c1",
            "id": "avatar"
        },
        "bio": {
            "name": "bio",
            "current": raw.attributes.bio,
            "max": "",
            "cid": "c2",
            "id": "bio"
        },
        "gmnotes": {
            "name": "gmnotes",
            "current": raw.attributes.gmnotes,
            "max": "",
            "cid": "c3",
            "id": "gmnotes"
        },
    }

    const ommitted_attrib_prefixes = ["army_", "kingdom_"] // copilot suggests "npc_"
    for (const attrib_model of raw.attribs.models) {
        const name = attrib_model.attributes.name
        if (ommitted_attrib_prefixes.some(prefix => name.startsWith(prefix))) {
            continue
        }
        formatted[name] = {
            "name": name,
            "current": attrib_model.attributes.current,
            "max": attrib_model.attributes.max,
            "cid": attrib_model.cid,
            "id": attrib_model.id,
        }
    }

    return formatted
}

function formatRepeating(formatted_or_raw_response) {
    const is_unformatted = (
        formatted_or_raw_response.attributes && 
        formatted_or_raw_response.attribs?.models instanceof Array
    )
    if (is_unformatted) {
        return formatted_or_raw_response
    }
}

function other_format_parse(chardata) {
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
        proficiencyBonus: 0, //assigned later
        proficiencies: {skills:[], saves:[], other:[]},
        expertise: {skills:[], saves:[], other:[]},
        halfProf: false, //assigned later
        languages: [],
        spells: [[], [], [], [], [], [], [], [], [], []],
        spellSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        spellcasting: [],
        notes: chardata.notes,
    }

    // Export
    window.character = character
    console.log(character)
    return character
}
