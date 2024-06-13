<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    char: Object
})
</script>

<template>
    <div id="spells">
        <div 
            v-for="(spells, lvl) in props.char.spells.filter(x => x.length > 0)"
            :class="['spell-level-' + lvl, 'spell-level']"
        >
            <h2>Level {{ lvl }}</h2>
            <div v-for="spell in spells" class="spell">
                <div class="spell-name">{{ spell.name }}</div>
                <div class="spell-data">
                    {{ 
                        [
                            spell.castingTime, 
                            spell.components, 
                            spell.range, 
                            spell.area, 
                            spell.duration
                        ].filter(x => x).join(" / ") 
                    }}
                </div>
                <div v-if="spell.damage" class="spell-data">{{ spell.damage }}</div>
            </div>
        </div>
    </div>
</template>