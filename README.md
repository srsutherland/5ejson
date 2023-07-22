# 5ejson

### [Demo here](https://srsutherland.github.io/5ejson/display_sheet)

## A json character sheet interchange format for D&amp;D 5e

There are a lot of different tools for building making and storing digital character sheets for 5e that have sprung up over the years. D&D beyond is the most official these days, we didn't always have that. And of course, you can't export it except by PDF, so if you play on a VTT like Roll20, you have to build and store it there. And then there's a plethora of android and iphone apps that all have their own formats that don't play nice.

The goal of this repo is to have a sheet format that acts as a common ground between these formats, storing the essential character info while not being too complex, and allowing you to export to any sheet you want.

---

### Currently supported import formats:
- 5ejson
- D&D Beyond (API v5). [Under development\]
    - (Downloaded using ctrl+s with [this userscript](./raw/main/userscript/dndb_dl.user.js))

Next in line:
- Roll20

---

### Currently supported output formats:
- 5ejson
- [Included web app](https://srsutherland.github.io/5ejson/display_sheet) [Under development\]
- Several pdfs: [Under development\]
    - [Standard layout (5E_CharacterSheet_Fillable.pdf)](./blob/main/pdfs/standard/5E_CharacterSheet_Fillable.pdf)
    - [Double-sided half-page sheet](./blob/main/pdfs/halfpage_double_color/D_and_D_Character_Sheet_halfpage_coloured_FormFillable_V2.pdf)
    - [One-page v6](./blob/main/pdfs/1page_v6/CharacterSheet_1page_form6.pdf)