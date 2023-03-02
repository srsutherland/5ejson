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