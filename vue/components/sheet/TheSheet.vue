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
    <SheetAbilityScores :char="char" />
    <SheetCombatSection :char="char" />
    <SheetSpells :char="char" />
  </section>
</template>

<style>
@import "../../../res/sheet.css"
</style>

<script></script>
