# AUTOMATIC1111 Master Asset Prompts - Blacklight Tarot

## Overview
These prompts generate the four master suit items for programmatic composition of the 56 Minor Arcana cards. Each item is designed on a transparent background for seamless compositing.

## Master Asset 1: Wands (Fire Element)

### Positive Prompt:
```
masterpiece, best quality, ultra detailed, crystalline magical staff, bioluminescent flames, nuclear green fire, plasma energy, transparent crystal shaft, glowing flame crown, cosmic fire particles, blacklight UV reactive, neon glow effects, magical energy trails, fantasy weapon, mystical staff, ethereal flames, translucent crystal, brilliant green fire, cosmic sparkles, energy wisps, magical aura, high contrast lighting, transparent background, isolated object, centered composition, 512x768, professional digital art
```

### Negative Prompt:
```
background, scenery, landscape, people, characters, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, out of frame, mutation, extra limbs, poorly drawn, bad anatomy, wrong anatomy, extra fingers, missing fingers, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, mutated hands, signature, username
```

### Parameters:
- **Dimensions:** 512x768
- **Steps:** 50
- **CFG Scale:** 8
- **Sampler:** DPM++ 2M Karras
- **Seed:** 42 (fixed for consistency)
- **Background:** Transparent PNG
- **LoRA:** blacklight_effects:0.8, crystal_materials:0.6

---

## Master Asset 2: Cups (Water Element)

### Positive Prompt:
```
masterpiece, best quality, ultra detailed, ethereal crystal chalice, cosmic water energy, cyan liquid light, bioluminescent water, translucent blue crystal cup, glowing aqua energy, flowing cosmic streams, magical goblet, mystical chalice, healing aura, rippling water effects, ocean teal highlights, silver rim accents, transparent crystal material, brilliant cyan glow, cosmic reflections, energy ripples, magical essence, high contrast lighting, transparent background, isolated object, centered composition, 512x768, professional digital art
```

### Negative Prompt:
```
background, scenery, landscape, people, characters, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, out of frame, mutation, extra limbs, poorly drawn, bad anatomy, wrong anatomy, extra fingers, missing fingers, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, mutated hands, signature, username
```

### Parameters:
- **Dimensions:** 512x768
- **Steps:** 50
- **CFG Scale:** 8
- **Sampler:** DPM++ 2M Karras
- **Seed:** 84 (fixed for consistency)
- **Background:** Transparent PNG
- **LoRA:** blacklight_effects:0.8, water_energy:0.7

---

## Master Asset 3: Swords (Air Element)

### Positive Prompt:
```
masterpiece, best quality, ultra detailed, energy blade sword, pure light weapon, electric violet energy, silver metallic handle, crackling lightning blade, plasma sword, magical weapon, mystical blade, brilliant purple energy, cosmic lightning effects, energy crackling, wind wisps, air element magic, translucent energy blade, solid silver grip, brilliant white highlights, cosmic electricity, magical aura, high contrast lighting, transparent background, isolated object, centered composition, 512x768, professional digital art
```

### Negative Prompt:
```
background, scenery, landscape, people, characters, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, out of frame, mutation, extra limbs, poorly drawn, bad anatomy, wrong anatomy, extra fingers, missing fingers, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, mutated hands, signature, username
```

### Parameters:
- **Dimensions:** 512x768
- **Steps:** 50
- **CFG Scale:** 8
- **Sampler:** DPM++ 2M Karras
- **Seed:** 126 (fixed for consistency)
- **Background:** Transparent PNG
- **LoRA:** blacklight_effects:0.8, energy_weapons:0.7

---

## Master Asset 4: Pentacles (Earth Element)

### Positive Prompt:
```
masterpiece, best quality, ultra detailed, crystalline pentacle coin, transparent crystal disc, golden pentagram symbol, sacred geometry, bioluminescent minerals, forest emerald glow, earth element magic, mystical coin, magical pentacle, cosmic crystal, geometric patterns, stable earth energy, prosperity symbols, translucent crystal material, solid gold pentagram, brilliant green glow, mineral crystalline structure, cosmic geometry, magical essence, high contrast lighting, transparent background, isolated object, centered composition, 512x768, professional digital art
```

### Negative Prompt:
```
background, scenery, landscape, people, characters, text, watermark, blurry, low quality, jpeg artifacts, duplicate, cropped, out of frame, mutation, extra limbs, poorly drawn, bad anatomy, wrong anatomy, extra fingers, missing fingers, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, mutated hands, signature, username
```

### Parameters:
- **Dimensions:** 512x768
- **Steps:** 50
- **CFG Scale:** 8
- **Sampler:** DPM++ 2M Karras
- **Seed:** 168 (fixed for consistency)
- **Background:** Transparent PNG
- **LoRA:** blacklight_effects:0.8, crystal_materials:0.6, sacred_geometry:0.5

---

## Generation Instructions

1. **Order of Generation:** Generate in sequence (Wands → Cups → Swords → Pentacles)
2. **File Naming:** 
   - `master_wand.png`
   - `master_cup.png` 
   - `master_sword.png`
   - `master_pentacle.png`
3. **Quality Control:** Ensure transparent backgrounds and consistent lighting
4. **Variations:** Use fixed seeds for reproducible results
5. **Post-Processing:** Verify alpha channel transparency before compositing

## Technical Notes

- All items designed for center-weighted composition
- Consistent 512x768 aspect ratio for uniform scaling
- Blacklight aesthetic maintained across all elements
- Transparent backgrounds essential for compositing script
- Fixed seeds ensure reproducible master assets
- LoRA weights optimized for blacklight/bioluminescent effects