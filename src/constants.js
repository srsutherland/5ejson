const deepFreeze = (obj) => {
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            deepFreeze(obj[key])
        }
    }
    return Object.freeze(obj)
}

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
    '______________', // 1-indexed
    'LG', 'NG', 'CG', 
    'LN', 'N',  'CN', 
    'LE', 'NE', 'CE'
])

// Abbreviations for long names
// eslint-disable-next-line no-unused-vars
const abbreviations = deepFreeze({
    subclass: {
        // First, words that are common to multiple most subclasses
        "Circle of the ": "", // Druid
        "Circle of ": "", // Druid
        "College of ": "", // Bard
        "Oath of ": "", // Paladin
        "Way of the ": "", // Monk
        "Way of ": "", // Monk
        " Domain": "", // Cleric
        "The ": "", // Warlock
        "School of ": "", // Wizard
        // Abbreviations for specific subclasses
        // Barbarian
        "Totem Warrior": "Totem",
        "Storm Herald": "Storm",
        "Ancestral Guardian": "Ancestral",
        // Bard
        // Cleric
        // Druid
        // Fighter
        "Battle Master": "BM",
        "Eldritch Knight": "EK",
        // Monk
        // Paladin
        // Ranger
        "Gloom Stalker": "Gloom",
        "Horizon Walker": "Horizon",
        // Rogue
        // Sorcerer
        "Abberrant Mind": "Abberrant",
        "Clockwork Soul": "Clockwork",
        "Divine Soul": "Divine",
        "Draconic Bloodline": "Draconic",
        "Shadow Magic": "Shadow",
        "Storm Sorcery": "Storm",
        "Wild Magic": "Wild",
        // Warlock
        "Great Old One": "GOO",
        "Raven Queen": "RQ",
        // Wizard
        "Order of Scribes": "Scribes",
    }
});
