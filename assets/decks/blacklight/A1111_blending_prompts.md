# AUTOMATIC1111 Blending Prompts - Blacklight Tarot

## Overview
This file contains prompts for final card generation:
- **img2img prompts**: For blending composed Minor Arcana cards (56 cards)
- **txt2img prompts**: For generating Major Arcana cards (22 cards)

---

## PART 1: Minor Arcana img2img Blending (56 Cards)

Use these prompts with the composed cards from `compose_cards.py` as input images.

### Universal img2img Settings:
- **Denoising Strength:** 0.4-0.6
- **CFG Scale:** 7-9
- **Steps:** 30-40
- **Sampler:** DPM++ 2M Karras
- **Resize Mode:** Just resize
- **Input Resolution:** 512x768

### Wands Suit (Fire Element) - img2img Prompts

#### Base Wands Prompt:
```
masterpiece, best quality, ultra detailed, blacklight tarot card, bioluminescent fire energy, nuclear green flames, crystalline wand staff, cosmic fire particles, volcanic landscape background, aurora sky, cosmic sparkles, magical energy trails, fantasy mysticism, ethereal glow effects, high contrast lighting, cosmic black background, 512x768, professional tarot art, mystical atmosphere, spiritual symbolism
```

#### Wands Negative Prompt:
```
realistic photo, modern objects, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, mutation, poorly drawn, bad anatomy, floating limbs, blur, signature, username, contemporary clothing, technology
```

### Cups Suit (Water Element) - img2img Prompts

#### Base Cups Prompt:
```
masterpiece, best quality, ultra detailed, blacklight tarot card, bioluminescent water energy, cyan liquid light, ethereal crystal chalice, cosmic ocean waves, nebula reflections, healing energy streams, magical goblet, mystical water effects, ocean teal highlights, cosmic ripples, high contrast lighting, cosmic black background, 512x768, professional tarot art, spiritual symbolism, emotional depth
```

#### Cups Negative Prompt:
```
realistic photo, modern objects, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, mutation, poorly drawn, bad anatomy, floating limbs, blur, signature, username, contemporary clothing, technology
```

### Swords Suit (Air Element) - img2img Prompts

#### Base Swords Prompt:
```
masterpiece, best quality, ultra detailed, blacklight tarot card, electric violet energy blade, crackling lightning effects, storm clouds background, cosmic electricity, silver metallic details, wind wisps, magical energy sword, brilliant purple glow, cosmic lightning bolts, mystical weapon, high contrast lighting, cosmic black background, 512x768, professional tarot art, mental clarity, spiritual truth
```

#### Swords Negative Prompt:
```
realistic photo, modern objects, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, mutation, poorly drawn, bad anatomy, floating limbs, blur, signature, username, contemporary clothing, technology
```

### Pentacles Suit (Earth Element) - img2img Prompts

#### Base Pentacles Prompt:
```
masterpiece, best quality, ultra detailed, blacklight tarot card, forest emerald crystal pentacle, golden sacred geometry, bioluminescent minerals, crystal cave background, earth energy glow, prosperity symbols, magical crystal disc, geometric patterns, stable earth magic, cosmic crystalline structures, high contrast lighting, cosmic black background, 512x768, professional tarot art, material manifestation, spiritual abundance
```

#### Pentacles Negative Prompt:
```
realistic photo, modern objects, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, mutation, poorly drawn, bad anatomy, floating limbs, blur, signature, username, contemporary clothing, technology
```

---

## PART 2: Major Arcana txt2img Generation (22 Cards)

Generate each Major Arcana card from scratch using these detailed prompts.

### Universal txt2img Settings:
- **Dimensions:** 512x768
- **CFG Scale:** 8-10
- **Steps:** 50-60
- **Sampler:** DPM++ 2M Karras
- **Seeds:** Use different seeds for variation

### Major Arcana Individual Prompts

#### 00 - The Fool
```
masterpiece, best quality, ultra detailed, The Fool tarot card, cosmic wanderer in stellar robes, blacklight UV reactive, electric violet robes, cyan energy aura, plasma pink cosmic background, glowing figure stepping off cosmic cliff edge, bioluminescent travel bag, ethereal spirit animal companion, cosmic cliff with stars below, mystical atmosphere, spiritual journey, new beginnings symbolism, 512x768, professional tarot art
```

#### 01 - The Magician  
```
masterpiece, best quality, ultra detailed, The Magician tarot card, cosmic energy master, blacklight UV reactive, nuclear green energy streams, pure white mystical robes, gold infinity symbol overhead, four elemental objects floating (wand, cup, sword, pentacle), energy connecting all elements, raised hands channeling cosmic power, manifestation magic, spiritual mastery, 512x768, professional tarot art
```

#### 02 - The High Priestess
```
masterpiece, best quality, ultra detailed, The High Priestess tarot card, cosmic mystery guardian, blacklight UV reactive, deep indigo mystical robes, silver crescent moon crown, cyan glowing pillars, flowing cosmic veil, sacred scroll with luminous symbols, intuitive wisdom, hidden knowledge, spiritual secrets, pomegranate symbolism, 512x768, professional tarot art
```

#### 03 - The Empress
```
masterpiece, best quality, ultra detailed, The Empress tarot card, cosmic mother goddess, blacklight UV reactive, forest emerald flowing gown, gold crown with stars, pink life energy aura, bioluminescent garden setting, cosmic river flowing, pregnant figure on throne, abundance and fertility, creative force, natural magic, 512x768, professional tarot art
```

#### 04 - The Emperor
```
masterpiece, best quality, ultra detailed, The Emperor tarot card, cosmic ruler authority, blacklight UV reactive, midnight purple royal robes, gold throne details, electric violet aurora background, crystalline throne formation, glowing ram head symbols, cosmic scepter, mountain peaks, divine order, structured power, 512x768, professional tarot art
```

#### 05 - The Hierophant
```
masterpiece, best quality, ultra detailed, The Hierophant tarot card, cosmic spiritual teacher, blacklight UV reactive, ocean teal ceremonial robes, silver cosmic keys, pure white light beams, sacred geometry patterns, celestial temple backdrop, two disciples in reverence, spiritual wisdom transmission, religious symbolism, 512x768, professional tarot art
```

#### 06 - The Lovers
```
masterpiece, best quality, ultra detailed, The Lovers tarot card, divine cosmic union, blacklight UV reactive, plasma pink energy bonds, electric violet angel overhead, nuclear green garden of light, cosmic tree of knowledge, two figures with intertwining auras, soul connection, divine blessing, love and harmony, 512x768, professional tarot art
```

#### 07 - The Chariot
```
masterpiece, best quality, ultra detailed, The Chariot tarot card, cosmic warrior control, blacklight UV reactive, cyan armor glow, midnight purple chariot, gold wheel symbols, two cosmic beasts pulling, aurora-filled sky background, victorious figure, willpower triumph, opposing forces controlled, 512x768, professional tarot art
```

#### 08 - Strength
```
masterpiece, best quality, ultra detailed, Strength tarot card, cosmic gentle power, blacklight UV reactive, pure white flowing robes, gold infinity symbol crown, nuclear green lion with peaceful expression, bioluminescent flowers, healing energy aura, inner strength harmony, spiritual courage, 512x768, professional tarot art
```

#### 09 - The Hermit
```
masterpiece, best quality, ultra detailed, The Hermit tarot card, cosmic seeker wisdom, blacklight UV reactive, deep indigo hooded cloak, electric violet lantern light, silver star-topped staff, mountain path ascending, cosmic spiral in night sky, solitary journey, inner guidance, spiritual seeking, 512x768, professional tarot art
```

#### 10 - Wheel of Fortune
```
masterpiece, best quality, ultra detailed, Wheel of Fortune tarot card, cosmic cycles fate, blacklight UV reactive, gold wheel rim spinning, plasma pink energy spirals, cyan creature glows in corners, four cosmic beings (eagle, lion, bull, angel), central divine eye, universal law, destiny and change, 512x768, professional tarot art
```

#### 11 - Justice
```
masterpiece, best quality, ultra detailed, Justice tarot card, cosmic divine balance, blacklight UV reactive, ocean teal ceremonial robes, silver scales of justice, pure white sword of truth, cosmic pillars background, balanced energy fields, crown of authority, divine law, karmic balance, 512x768, professional tarot art
```

#### 12 - The Hanged Man
```
masterpiece, best quality, ultra detailed, The Hanged Man tarot card, cosmic willing sacrifice, blacklight UV reactive, nuclear green tree glow, gold halo radiance, deep indigo cosmic void, inverted figure in peaceful suspension, enlightenment through surrender, spiritual sacrifice, new perspective, 512x768, professional tarot art
```

#### 13 - Death
```
masterpiece, best quality, ultra detailed, Death tarot card, cosmic transformation, blacklight UV reactive, midnight purple cloak of change, silver scythe blade, plasma pink sunrise horizon, skeletal figure on pale horse, landscape transforming, inevitable change, renewal and rebirth, 512x768, professional tarot art
```

#### 14 - Temperance
```
masterpiece, best quality, ultra detailed, Temperance tarot card, cosmic divine alchemy, blacklight UV reactive, pure white angelic robes, cyan liquid energy flowing, gold solar disk on forehead, one foot in cosmic stream, mountain path ahead, divine moderation, perfect balance, 512x768, professional tarot art
```

#### 15 - The Devil
```
masterpiece, best quality, ultra detailed, The Devil tarot card, cosmic shadow bondage, blacklight UV reactive, deep indigo shadow realm, electric violet chains of illusion, forest emerald inverted pentagram, horned figure with dark energy, two chained figures below, material temptation, spiritual bondage, 512x768, professional tarot art
```

#### 16 - The Tower
```
masterpiece, best quality, ultra detailed, The Tower tarot card, cosmic sudden upheaval, blacklight UV reactive, nuclear green lightning bolts, plasma pink energy destruction, midnight purple crumbling tower, falling figures, toppling crown, divine eye in storm, false structures destroyed, 512x768, professional tarot art
```

#### 17 - The Star
```
masterpiece, best quality, ultra detailed, The Star tarot card, cosmic hope inspiration, blacklight UV reactive, electric violet large star overhead, seven smaller cyan stars, silver figure kneeling, cosmic water pools, pouring cosmic energy streams, divine guidance, spiritual hope, 512x768, professional tarot art
```

#### 18 - The Moon
```
masterpiece, best quality, ultra detailed, The Moon tarot card, cosmic illusion mystery, blacklight UV reactive, deep indigo night sky, silver moon with face, ocean teal water pools, cosmic crab emerging, wolf and dog howling, twin pillars, subconscious depths, intuitive navigation, 512x768, professional tarot art
```

#### 19 - The Sun
```
masterpiece, best quality, ultra detailed, The Sun tarot card, cosmic joy enlightenment, blacklight UV reactive, brilliant gold sun with radiant face, pure white horse, nuclear green sunflower garden, joyful child figure, brick wall background, achieved consciousness, divine happiness, 512x768, professional tarot art
```

#### 20 - Judgement
```
masterpiece, best quality, ultra detailed, Judgement tarot card, cosmic spiritual awakening, blacklight UV reactive, electric violet angel wings, silver trumpet of calling, plasma pink resurrection energy, rising figures below, cross banner, divine trumpet call, spiritual rebirth, 512x768, professional tarot art
```

#### 21 - The World
```
masterpiece, best quality, ultra detailed, The World tarot card, cosmic completion unity, blacklight UV reactive, dancing figure in cosmic oval, four corner creatures (eagle, lion, bull, angel), gold laurel wreath border, all spectrum colors harmonized, universal integration, cosmic achievement, 512x768, professional tarot art
```

### Universal Negative Prompt for Major Arcana:
```
realistic photography, modern objects, contemporary clothing, technology, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, mutation, poorly drawn, bad anatomy, extra fingers, missing fingers, floating limbs, disconnected limbs, malformed hands, blur, out of focus, signature, username, bad proportions
```

---

## Generation Workflow

### For Minor Arcana (img2img):
1. Run `compose_cards.py` to generate 56 composed cards
2. Load each composed card into AUTOMATIC1111 img2img
3. Use appropriate suit prompt with universal negative
4. Apply settings: denoising 0.4-0.6, CFG 7-9, steps 30-40
5. Generate final blended card

### For Major Arcana (txt2img):
1. Use individual card prompt from above
2. Apply universal negative prompt
3. Settings: CFG 8-10, steps 50-60, sampler DPM++ 2M Karras
4. Generate card at 512x768

### Quality Control:
- Verify blacklight aesthetic consistency
- Ensure transparent backgrounds where needed
- Check for proper tarot symbolism
- Validate cosmic color palette adherence
- Confirm 512x768 dimensions