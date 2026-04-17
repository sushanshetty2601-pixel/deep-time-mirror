# 🌍 Deep-Time Mirror

### *Piercing the veil of time for Earth Day 2026.*

**Deep-Time Mirror** is an immersive, AI-powered ecological portal that visualizes the environmental history and restored future of any location on Earth. Built for the Earth Day Challenge, it combines high-performance 3D graphics with real-time generative storytelling to bridge the gap between our primeval past and a sustainable solar-punk tomorrow.

---

## ⚡ The Experience

1. **The Portal:** Enter any city, forest, or park.
2. **Temporal Synthesis:** The AI stabilization engine kicks in, generating a cinematic, full-screen 3D visual of your location.
3. **Deep Past (~10,000 BCE):** Witness the land in its untouched, primeval glory. Meet ancient species and see the world before the Anthropocene.
4. **The Present:** A gritty, realistic look at current ecological challenges, complete with a "Recent Pulse" that grabs local environmental data from 1 day and 1 week ago.
5. **Restored Future (~2100 CE):** A solar-punk vision of restoration. Witness how architecture and nature can coexist in a vibrant, clean-energy ecosystem.

---

## 🍃 A Message for Earth Day 2026

As we stand at the crossroads of climate history, **Deep-Time Mirror** is more than just an app—it's a call to witness. 

On this Earth Day, we want to remind the world:
- **The Past is our Foundation:** 10,000 years ago, our planet breathed in perfect silence. We must remember what "untouched" truly looks like to understand what we have lost.
- **The Present is our Pivot:** Every bird sighting, every air quality shift, and every local conservation effort 1 day or 1 week ago is a heartbeat of our planet. We are not just observers of the Anthropocene; we are its architects.
- **The Future is our Choice:** The solar-punk visions in this mirror are not fantasies—they are blueprints. Restoration is possible if we choose to weave our technology back into the roots of the world.

*Let us look into the mirror, not just to see where we were, but to decide where we are going.*

---

This project was built with a focused, high-performance stack:

- **Core Engine:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Artificial Intelligence:** 
  - **Gemini 2.5 Flash:** Powers the cinematic environmental visuals (Real-time generation).
  - **Gemini 3 Flash:** Powers the temporal narratives, ecological stats, and "Google Search" grounded real-time data.
- **3D Graphics:** [Three.js](https://threejs.org/) via `@react-three/fiber` and `@react-three/drei` (Temporal Sphere & Animated Hero Mirrors).
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) with a custom editorial/luxury theme.
- **Motion:** [Framer Motion](https://www.framer.com/motion/) for cinematic transitions and glass-panel effects.
- **Content:** [React-Markdown](https://github.com/remarkjs/react-markdown) for rich AI-generated narratives.

---

## 🔬 How it Works

The app utilizes **LLM-driven temporal grounding**. When a user searches for a location:
1. **Gemini Search:** The AI fetches real-time ecological reports and historical climate data.
2. **Visual Synthesis:** It creates detailed visual prompts for the Image Generation Model to render the "Mirror" views.
3. **Structured Temporal Data:** The system parses the data into three JSON-structured epochs, ensuring factual consistency while maintaining poetic, editorial narrative quality.

---

## 👨‍💻 Author

Built with 💚 for the planet by:
**[Sushan Shetty (sushanshetty2601-pixel)](https://github.com/sushanshetty2601-pixel)**

---

## 🚀 Getting Started

1. Clone the repo.
2. Install dependencies: `npm install`
3. Add your `GEMINI_API_KEY` to the `.env` file.
4. Run the development server: `npm run dev`
5. Pierce the veil of time!
