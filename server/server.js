import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema
const Schema = mongoose.Schema;

const pokemonSchema = new mongoose.Schema({
  name: String,
  type: [String],
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    speed: Number,
  },
  sprites: {
    front_default: String,
  },
  battles: [
    {
      opponent: { type: Schema.Types.ObjectId, ref: "Pokemon" },
      winner: { type: Schema.Types.ObjectId, ref: "Pokemon" },
    },
  ],
  battleStats: {
    wins: { type: Number, default: 0 },
    loses: { type: Number, default: 0 },
  },
});

const Pokemon = mongoose.model("Pokemon", pokemonSchema);

// Fetch and save all Pokemon on startup
const fetchAndSaveAllPokemon = async () => {
  try {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon/?limit=151"
    );
    const requests = response.data.results.map((pokemon) =>
      axios.get(pokemon.url)
    );
    const pokemonResponses = await Promise.all(requests);

    const pokemonData = pokemonResponses.map((res) => ({
      name: res.data.name,
      type: res.data.types.map((typeInfo) => typeInfo.type.name),
      stats: {
        hp: res.data.stats.find((stat) => stat.stat.name === "hp")?.base_stat || 0,
        attack: res.data.stats.find((stat) => stat.stat.name === "attack")?.base_stat || 0,
        defense: res.data.stats.find((stat) => stat.stat.name === "defense")?.base_stat || 0,
        speed: res.data.stats.find((stat) => stat.stat.name === "speed")?.base_stat || 0,
      },
      sprites: {
        front_default: res.data.sprites.front_default,
      },
      battleStats: {
        wins: 0,
        loses: 0,
      },
    }));

    for (const pokemon of pokemonData) {
      await Pokemon.updateOne(
        { name: pokemon.name },
        { $setOnInsert: pokemon },
        { upsert: true }
      );
    }

    console.log("Pokemon data initialized successfully");
  } catch (error) {
    console.error("Error initializing Pokemon data:", error.message);
  }
};

fetchAndSaveAllPokemon();

// Get all Pokemon
app.get("/api/pokemon", async (req, res) => {
  try {
    const pokemons = await Pokemon.find();
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Pokemon" });
  }
});

// Get battle stats
app.get("/api/battlestats", async (req, res) => {
  try {
    const stats = await Pokemon.find();
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Save battle result
app.post("/api/battleresults", async (req, res) => {
  try {
    const [p1, p2] = req.body.selectedPokemon;
    const battleResult = req.body.battleResult;

    // Handle tie games
    if (battleResult === "tie") {
      const fighterOne = await Pokemon.findOneAndUpdate(
        { name: p1.name },
        { $setOnInsert: { name: p1.name, battleStats: { wins: 0, loses: 0 } } },
        { upsert: true, new: true }
      );

      const fighterTwo = await Pokemon.findOneAndUpdate(
        { name: p2.name },
        { $setOnInsert: { name: p2.name, battleStats: { wins: 0, loses: 0 } } },
        { upsert: true, new: true }
      );

      fighterOne.battles.push({
        opponent: fighterTwo._id,
        winner: null, // No winner for tie
      });

      fighterTwo.battles.push({
        opponent: fighterOne._id,
        winner: null,
      });

      await fighterOne.save();
      await fighterTwo.save();

      return res.status(200).json({ message: "Tie game recorded" });
    }

    const winnerName = battleResult.split(" ")[0];

    const fighterOne = await Pokemon.findOneAndUpdate(
      { name: p1.name },
      { $setOnInsert: { name: p1.name, battleStats: { wins: 0, loses: 0 } } },
      { upsert: true, new: true }
    );

    const fighterTwo = await Pokemon.findOneAndUpdate(
      { name: p2.name },
      { $setOnInsert: { name: p2.name, battleStats: { wins: 0, loses: 0 } } },
      { upsert: true, new: true }
    );

    const fighterOneWins = fighterOne.name === winnerName;
    const fighterTwoWins = fighterTwo.name === winnerName;

    fighterOne.battles.push({
      opponent: fighterTwo._id,
      winner: fighterOneWins ? fighterOne._id : fighterTwo._id,
    });

    fighterTwo.battles.push({
      opponent: fighterOne._id,
      winner: fighterTwoWins ? fighterTwo._id : fighterOne._id,
    });

    fighterOne.battleStats.wins += fighterOneWins ? 1 : 0;
    fighterOne.battleStats.loses += fighterOneWins ? 0 : 1;
    fighterTwo.battleStats.wins += fighterTwoWins ? 1 : 0;
    fighterTwo.battleStats.loses += fighterTwoWins ? 0 : 1;

    await fighterOne.save();
    await fighterTwo.save();

    res.status(200).json({ message: "Battle results saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save battle results" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
