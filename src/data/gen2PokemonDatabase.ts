export interface Gen2Pokemon {
  id: number;
  name: string;
  types: string[];
  hp: number;
  attack: number;
  defense: number;
  signatureMove: {
    name: string;
    damage: number;
    description: string;
  };
}

export const gen2Pokemon: Gen2Pokemon[] = [
  // Missing Mew from Gen 1
  { id: 151, name: "Mew", types: ["Psychic"], hp: 100, attack: 100, defense: 100, signatureMove: { name: "Psychic", damage: 50, description: "Ultimate psychic power" } },
  
  // Gen 2 Starters
  { id: 152, name: "Chikorita", types: ["Grass"], hp: 45, attack: 49, defense: 65, signatureMove: { name: "Razor Leaf", damage: 25, description: "Sharp leaf attack" } },
  { id: 153, name: "Bayleef", types: ["Grass"], hp: 60, attack: 62, defense: 80, signatureMove: { name: "Body Slam", damage: 35, description: "May paralyze" } },
  { id: 154, name: "Meganium", types: ["Grass"], hp: 80, attack: 82, defense: 100, signatureMove: { name: "Petal Dance", damage: 55, description: "Powerful but confusing" } },
  { id: 155, name: "Cyndaquil", types: ["Fire"], hp: 39, attack: 52, defense: 43, signatureMove: { name: "Ember", damage: 22, description: "Small flames scorch" } },
  { id: 156, name: "Quilava", types: ["Fire"], hp: 58, attack: 64, defense: 58, signatureMove: { name: "Flame Wheel", damage: 35, description: "Fiery rolling attack" } },
  { id: 157, name: "Typhlosion", types: ["Fire"], hp: 78, attack: 84, defense: 78, signatureMove: { name: "Eruption", damage: 60, description: "More powerful when HP is high" } },
  { id: 158, name: "Totodile", types: ["Water"], hp: 50, attack: 65, defense: 64, signatureMove: { name: "Water Gun", damage: 20, description: "Shoots water" } },
  { id: 159, name: "Croconaw", types: ["Water"], hp: 65, attack: 80, defense: 80, signatureMove: { name: "Bite", damage: 30, description: "May cause flinching" } },
  { id: 160, name: "Feraligatr", types: ["Water"], hp: 85, attack: 105, defense: 100, signatureMove: { name: "Hydro Pump", damage: 55, description: "Powerful water blast" } },
  
  // Baby Pokemon
  { id: 161, name: "Pichu", types: ["Electric"], hp: 20, attack: 40, defense: 15, signatureMove: { name: "Thunder Shock", damage: 15, description: "Weak electric attack" } },
  { id: 162, name: "Cleffa", types: ["Fairy"], hp: 50, attack: 25, defense: 28, signatureMove: { name: "Pound", damage: 15, description: "Simple physical attack" } },
  { id: 163, name: "Igglybuff", types: ["Normal", "Fairy"], hp: 90, attack: 30, defense: 15, signatureMove: { name: "Sing", damage: 0, description: "Puts enemy to sleep" } },
  { id: 164, name: "Togepi", types: ["Fairy"], hp: 35, attack: 20, defense: 65, signatureMove: { name: "Metronome", damage: 25, description: "Uses random move" } },
  { id: 165, name: "Togetic", types: ["Fairy", "Flying"], hp: 55, attack: 40, defense: 85, signatureMove: { name: "Metronome", damage: 30, description: "Uses random move" } },
  
  // New Evolutions
  { id: 166, name: "Crobat", types: ["Poison", "Flying"], hp: 85, attack: 90, defense: 80, signatureMove: { name: "Cross Poison", damage: 45, description: "High critical hit ratio" } },
  { id: 167, name: "Bellossom", types: ["Grass"], hp: 75, attack: 80, defense: 95, signatureMove: { name: "Petal Dance", damage: 50, description: "Powerful but confusing" } },
  { id: 168, name: "Politoed", types: ["Water"], hp: 90, attack: 75, defense: 75, signatureMove: { name: "Perish Song", damage: 0, description: "KOs all Pokemon in 3 turns" } },
  { id: 169, name: "Espeon", types: ["Psychic"], hp: 65, attack: 65, defense: 60, signatureMove: { name: "Psychic", damage: 50, description: "Powerful psychic force" } },
  { id: 170, name: "Umbreon", types: ["Dark"], hp: 95, attack: 65, defense: 110, signatureMove: { name: "Dark Pulse", damage: 40, description: "May cause flinching" } },
  { id: 171, name: "Slowking", types: ["Water", "Psychic"], hp: 95, attack: 75, defense: 80, signatureMove: { name: "Psychic", damage: 45, description: "Powerful psychic attack" } },
  { id: 172, name: "Kingdra", types: ["Water", "Dragon"], hp: 75, attack: 95, defense: 95, signatureMove: { name: "Dragon Pulse", damage: 50, description: "Draconic energy blast" } },
  { id: 173, name: "Scizor", types: ["Bug", "Steel"], hp: 70, attack: 130, defense: 100, signatureMove: { name: "Bullet Punch", damage: 40, description: "Always goes first" } },
  { id: 174, name: "Steelix", types: ["Steel", "Ground"], hp: 75, attack: 85, defense: 200, signatureMove: { name: "Iron Tail", damage: 50, description: "May lower defense" } },
  
  // Fighting Evolution Line
  { id: 175, name: "Tyrogue", types: ["Fighting"], hp: 35, attack: 35, defense: 35, signatureMove: { name: "Tackle", damage: 20, description: "Basic physical attack" } },
  { id: 176, name: "Hitmontop", types: ["Fighting"], hp: 50, attack: 95, defense: 95, signatureMove: { name: "Triple Kick", damage: 40, description: "Hits three times" } },
  { id: 177, name: "Smoochum", types: ["Ice", "Psychic"], hp: 45, attack: 30, defense: 15, signatureMove: { name: "Powder Snow", damage: 20, description: "May freeze target" } },
  { id: 178, name: "Elekid", types: ["Electric"], hp: 45, attack: 63, defense: 37, signatureMove: { name: "Thunder Punch", damage: 30, description: "May paralyze" } },
  { id: 179, name: "Magby", types: ["Fire"], hp: 45, attack: 75, defense: 37, signatureMove: { name: "Fire Punch", damage: 30, description: "May burn target" } },
  { id: 180, name: "Blissey", types: ["Normal"], hp: 255, attack: 10, defense: 10, signatureMove: { name: "Soft-Boiled", damage: 0, description: "Recovers HP" } },
  
  // Early Gen 2 Pokemon
  { id: 181, name: "Sentret", types: ["Normal"], hp: 35, attack: 46, defense: 34, signatureMove: { name: "Quick Attack", damage: 20, description: "Always goes first" } },
  { id: 182, name: "Furret", types: ["Normal"], hp: 85, attack: 76, defense: 64, signatureMove: { name: "Slam", damage: 40, description: "Powerful physical attack" } },
  { id: 183, name: "Hoothoot", types: ["Normal", "Flying"], hp: 60, attack: 30, defense: 30, signatureMove: { name: "Peck", damage: 18, description: "Sharp beak attack" } },
  { id: 184, name: "Noctowl", types: ["Normal", "Flying"], hp: 100, attack: 50, defense: 50, signatureMove: { name: "Air Slash", damage: 35, description: "May cause flinching" } },
  { id: 185, name: "Ledyba", types: ["Bug", "Flying"], hp: 40, attack: 20, defense: 30, signatureMove: { name: "Tackle", damage: 15, description: "Basic physical attack" } },
  { id: 186, name: "Ledian", types: ["Bug", "Flying"], hp: 55, attack: 35, defense: 50, signatureMove: { name: "Comet Punch", damage: 30, description: "Multi-hit attack" } },
  { id: 187, name: "Spinarak", types: ["Bug", "Poison"], hp: 40, attack: 60, defense: 40, signatureMove: { name: "Poison Sting", damage: 18, description: "May poison target" } },
  { id: 188, name: "Ariados", types: ["Bug", "Poison"], hp: 70, attack: 90, defense: 70, signatureMove: { name: "Spider Web", damage: 0, description: "Prevents escape" } },
  { id: 189, name: "Mareep", types: ["Electric"], hp: 55, attack: 40, defense: 40, signatureMove: { name: "Thunder Shock", damage: 20, description: "May paralyze" } },
  { id: 190, name: "Flaaffy", types: ["Electric"], hp: 70, attack: 55, defense: 55, signatureMove: { name: "Thunderbolt", damage: 35, description: "May paralyze" } },
  { id: 191, name: "Ampharos", types: ["Electric"], hp: 90, attack: 75, defense: 85, signatureMove: { name: "Thunder", damage: 50, description: "May paralyze" } },
  { id: 192, name: "Marill", types: ["Water", "Fairy"], hp: 70, attack: 20, defense: 50, signatureMove: { name: "Bubble Beam", damage: 25, description: "May lower speed" } },
  { id: 193, name: "Azumarill", types: ["Water", "Fairy"], hp: 100, attack: 50, defense: 80, signatureMove: { name: "Aqua Tail", damage: 45, description: "Powerful water attack" } },
  { id: 194, name: "Sudowoodo", types: ["Rock"], hp: 70, attack: 100, defense: 115, signatureMove: { name: "Rock Slide", damage: 35, description: "May cause flinching" } },
  { id: 195, name: "Skiploom", types: ["Grass", "Flying"], hp: 55, attack: 45, defense: 50, signatureMove: { name: "Bullet Seed", damage: 30, description: "Multi-hit attack" } },
  { id: 196, name: "Jumpluff", types: ["Grass", "Flying"], hp: 75, attack: 55, defense: 70, signatureMove: { name: "Sleep Powder", damage: 0, description: "Puts enemy to sleep" } },
  { id: 197, name: "Aipom", types: ["Normal"], hp: 55, attack: 70, defense: 55, signatureMove: { name: "Swift", damage: 30, description: "Never misses" } },
  { id: 198, name: "Sunkern", types: ["Grass"], hp: 30, attack: 30, defense: 30, signatureMove: { name: "Absorb", damage: 15, description: "Drains HP" } },
  { id: 199, name: "Sunflora", types: ["Grass"], hp: 75, attack: 75, defense: 55, signatureMove: { name: "Solar Beam", damage: 55, description: "Charges then attacks" } },
  { id: 200, name: "Yanma", types: ["Bug", "Flying"], hp: 65, attack: 65, defense: 45, signatureMove: { name: "Wing Attack", damage: 30, description: "Strikes with wings" } },
  { id: 201, name: "Wooper", types: ["Water", "Ground"], hp: 55, attack: 45, defense: 45, signatureMove: { name: "Water Gun", damage: 20, description: "Shoots water" } },
  { id: 202, name: "Quagsire", types: ["Water", "Ground"], hp: 95, attack: 85, defense: 85, signatureMove: { name: "Earthquake", damage: 45, description: "Ground shaking attack" } },
  { id: 203, name: "Murkrow", types: ["Dark", "Flying"], hp: 60, attack: 85, defense: 42, signatureMove: { name: "Peck", damage: 25, description: "Sharp beak attack" } },
  { id: 204, name: "Misdreavus", types: ["Ghost"], hp: 60, attack: 60, defense: 60, signatureMove: { name: "Shadow Ball", damage: 40, description: "May lower defense" } },
  { id: 205, name: "Unown", types: ["Psychic"], hp: 48, attack: 72, defense: 48, signatureMove: { name: "Hidden Power", damage: 35, description: "Type varies" } },
  { id: 206, name: "Wobbuffet", types: ["Psychic"], hp: 190, attack: 33, defense: 58, signatureMove: { name: "Counter", damage: 0, description: "Returns double damage" } },
  { id: 207, name: "Girafarig", types: ["Normal", "Psychic"], hp: 70, attack: 80, defense: 65, signatureMove: { name: "Psybeam", damage: 35, description: "May confuse target" } },
  { id: 208, name: "Pineco", types: ["Bug"], hp: 50, attack: 65, defense: 90, signatureMove: { name: "Self-Destruct", damage: 50, description: "User faints" } },
  { id: 209, name: "Forretress", types: ["Bug", "Steel"], hp: 75, attack: 90, defense: 140, signatureMove: { name: "Explosion", damage: 60, description: "User faints" } },
  { id: 210, name: "Dunsparce", types: ["Normal"], hp: 100, attack: 70, defense: 70, signatureMove: { name: "Drill Run", damage: 40, description: "High critical hit ratio" } },
  { id: 211, name: "Gligar", types: ["Ground", "Flying"], hp: 65, attack: 75, defense: 105, signatureMove: { name: "Slash", damage: 35, description: "High critical hit ratio" } },
  { id: 212, name: "Snubbull", types: ["Fairy"], hp: 60, attack: 80, defense: 50, signatureMove: { name: "Bite", damage: 25, description: "May cause flinching" } },
  { id: 213, name: "Granbull", types: ["Fairy"], hp: 90, attack: 120, defense: 75, signatureMove: { name: "Crunch", damage: 40, description: "May lower defense" } },
  { id: 214, name: "Qwilfish", types: ["Water", "Poison"], hp: 65, attack: 95, defense: 85, signatureMove: { name: "Poison Jab", damage: 40, description: "May poison target" } },
  { id: 215, name: "Shuckle", types: ["Bug", "Rock"], hp: 20, attack: 10, defense: 230, signatureMove: { name: "Wrap", damage: 15, description: "Traps for 2-5 turns" } },
  { id: 216, name: "Heracross", types: ["Bug", "Fighting"], hp: 80, attack: 125, defense: 75, signatureMove: { name: "Megahorn", damage: 55, description: "Powerful horn attack" } },
  { id: 217, name: "Sneasel", types: ["Dark", "Ice"], hp: 55, attack: 95, defense: 55, signatureMove: { name: "Slash", damage: 35, description: "High critical hit ratio" } },
  { id: 218, name: "Teddiursa", types: ["Normal"], hp: 60, attack: 80, defense: 50, signatureMove: { name: "Slash", damage: 30, description: "High critical hit ratio" } },
  { id: 219, name: "Ursaring", types: ["Normal"], hp: 90, attack: 130, defense: 75, signatureMove: { name: "Hammer Arm", damage: 50, description: "Lowers speed" } },
  { id: 220, name: "Slugma", types: ["Fire"], hp: 40, attack: 40, defense: 40, signatureMove: { name: "Ember", damage: 20, description: "May burn target" } },
  { id: 221, name: "Magcargo", types: ["Fire", "Rock"], hp: 60, attack: 50, defense: 120, signatureMove: { name: "Lava Plume", damage: 40, description: "May burn target" } },
  { id: 222, name: "Swinub", types: ["Ice", "Ground"], hp: 50, attack: 50, defense: 40, signatureMove: { name: "Powder Snow", damage: 20, description: "May freeze target" } },
  { id: 223, name: "Piloswine", types: ["Ice", "Ground"], hp: 100, attack: 100, defense: 80, signatureMove: { name: "Blizzard", damage: 50, description: "May freeze target" } },
  { id: 224, name: "Corsola", types: ["Water", "Rock"], hp: 65, attack: 55, defense: 95, signatureMove: { name: "Spike Cannon", damage: 35, description: "Multi-hit attack" } },
  { id: 225, name: "Remoraid", types: ["Water"], hp: 35, attack: 65, defense: 35, signatureMove: { name: "Water Gun", damage: 20, description: "Shoots water" } },
  { id: 226, name: "Octillery", types: ["Water"], hp: 75, attack: 105, defense: 75, signatureMove: { name: "Octazooka", damage: 45, description: "May lower accuracy" } },
  { id: 227, name: "Delibird", types: ["Ice", "Flying"], hp: 45, attack: 55, defense: 45, signatureMove: { name: "Present", damage: 30, description: "May heal or damage" } },
  { id: 228, name: "Mantine", types: ["Water", "Flying"], hp: 85, attack: 40, defense: 70, signatureMove: { name: "Wing Attack", damage: 30, description: "Strikes with wings" } },
  { id: 229, name: "Skarmory", types: ["Steel", "Flying"], hp: 65, attack: 80, defense: 140, signatureMove: { name: "Steel Wing", damage: 40, description: "May raise defense" } },
  { id: 230, name: "Houndour", types: ["Dark", "Fire"], hp: 45, attack: 60, defense: 30, signatureMove: { name: "Bite", damage: 25, description: "May cause flinching" } },
  { id: 231, name: "Houndoom", types: ["Dark", "Fire"], hp: 75, attack: 90, defense: 50, signatureMove: { name: "Crunch", damage: 40, description: "May lower defense" } },
  { id: 232, name: "Phanpy", types: ["Ground"], hp: 90, attack: 60, defense: 60, signatureMove: { name: "Rollout", damage: 25, description: "Power increases each turn" } },
  { id: 233, name: "Donphan", types: ["Ground"], hp: 90, attack: 120, defense: 120, signatureMove: { name: "Earthquake", damage: 50, description: "Ground shaking attack" } },
  { id: 234, name: "Porygon2", types: ["Normal"], hp: 85, attack: 80, defense: 90, signatureMove: { name: "Tri Attack", damage: 40, description: "May burn, freeze, or paralyze" } },
  { id: 235, name: "Smeargle", types: ["Normal"], hp: 55, attack: 20, defense: 35, signatureMove: { name: "Sketch", damage: 0, description: "Copies opponent's move" } },
  
  // Legendaries
  { id: 236, name: "Raikou", types: ["Electric"], hp: 90, attack: 85, defense: 75, signatureMove: { name: "Thunder", damage: 55, description: "May paralyze" } },
  { id: 237, name: "Entei", types: ["Fire"], hp: 115, attack: 115, defense: 85, signatureMove: { name: "Sacred Fire", damage: 55, description: "May burn target" } },
  { id: 238, name: "Suicune", types: ["Water"], hp: 100, attack: 75, defense: 115, signatureMove: { name: "Hydro Pump", damage: 55, description: "Powerful water blast" } },
  { id: 239, name: "Larvitar", types: ["Rock", "Ground"], hp: 50, attack: 64, defense: 50, signatureMove: { name: "Bite", damage: 25, description: "May cause flinching" } },
  { id: 240, name: "Pupitar", types: ["Rock", "Ground"], hp: 70, attack: 84, defense: 70, signatureMove: { name: "Rock Slide", damage: 35, description: "May cause flinching" } },
  { id: 241, name: "Tyranitar", types: ["Rock", "Dark"], hp: 100, attack: 134, defense: 110, signatureMove: { name: "Crunch", damage: 55, description: "May lower defense" } },
  { id: 242, name: "Lugia", types: ["Psychic", "Flying"], hp: 106, attack: 90, defense: 130, signatureMove: { name: "Aeroblast", damage: 60, description: "High critical hit ratio" } },
  { id: 243, name: "Ho-Oh", types: ["Fire", "Flying"], hp: 106, attack: 130, defense: 90, signatureMove: { name: "Sacred Fire", damage: 60, description: "May burn target" } },
  { id: 244, name: "Celebi", types: ["Psychic", "Grass"], hp: 100, attack: 100, defense: 100, signatureMove: { name: "Psychic", damage: 50, description: "Time travel power" } }
];