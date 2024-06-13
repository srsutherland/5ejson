<script setup>
// eslint-disable-next-line no-unused-vars
import { ref } from 'vue'

import SheetHeader from './SheetHeader.vue'
import SheetAbilityScores from './SheetAbilityScores.vue'
import SheetCombatSection from './SheetCombatSection.vue'
import SheetSpells from './SheetSpells.vue'

import '../../../src/dndbeyond.js'
import { dndbeyond_json_parse } from '../../../src/dndbeyond.js'
import json from '../../../test_json/dndb/Jack.dndb.json'

//const real_root = '../../..'

const json2 = dndbeyond_json_parse(json)
const char = ref(json2)
</script>
<template>
  <section v-if="char" id="sheet">
    <SheetHeader :char="char" />
    <SheetAbilityScores />
    <SheetCombatSection />
    <SheetSpells />
  </section>
</template>

<script></script>
