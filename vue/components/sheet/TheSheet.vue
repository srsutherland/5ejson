<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onBeforeMount } from 'vue'

import SheetHeader from './SheetHeader.vue'
import SheetAbilityScores from './SheetAbilityScores.vue'
import SheetCombatSection from './SheetCombatSection.vue'
import SheetSpells from './SheetSpells.vue'

import { dndbeyond_json_parse } from '../../../src/dndbeyond.js'
import json from '../../../test_json/dndb/Jack.dndb.json'

//const real_root = '../../..'

const json2 = dndbeyond_json_parse(json)
const char = ref(json2)

const props = defineProps({
    char: {
      type: Object,
      default: () => {
        return dndbeyond_json_parse(json);
      }
    }
})
</script>

<template>
  <section v-if="props.char" id="sheet">
    <SheetHeader :char="props.char" />
    <SheetAbilityScores :char="props.char" />
    <SheetCombatSection :char="props.char" />
    <SheetSpells :char="props.char" />
  </section>
  <section v-else>
    <p>Sheet not loaded</p>
  </section>
</template>

<style>
@import "../../../res/sheet.css"
</style>

<script></script>
