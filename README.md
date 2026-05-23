# Ignis — Interactive Ignatian Discernment & Daily Examen Journal

**Ignis** is a premium, fully-functional web application prototype designed as a portfolio showcase. As a freelance developer, you can use this codebase to pitch highly polished, secure, and mission-aligned digital products to **Jesuit Retreat Centers, Parishes, High Schools, Universities, and Dioceses**.

---

## 🌟 Pitch Deck: Why This App Sells to Jesuit Clients

Jesuit organizations are highly intellectual, deeply spiritual, and strictly ethical. When pitching to them, this app demonstrates that you understand their unique vocabulary and goals:

1. **Perfect Alignment with the UAPs (Universal Apostolic Preferences):**
   * **Showing the Way to God:** Digitizes the *Daily Examen* and *Spiritual Exercises* in an elegant, modern, accessible layout.
   * **Journeying with Youth / AI Literacy:** Demonstrates an ethical approach to AI. Instead of "lazy writing shortcuts," the Socratic Coach models a "formation partner" that encourages critical thinking and interior transparency.
2. **Commitment to "Algorethics" (AI Ethics):**
   * Demonstrates a human-centric approach to software engineering, honoring the Vatican’s *Rome Call for AI Ethics*.
   * Completely private out-of-the-box. Uses **local storage** for zero cloud footprints unless they explicitly request cloud syncing.
3. **Cura Personalis (Care for the Individual):**
   * Features a premium **Contemplative Audio Engine** (synthesizer) to help users calm down and focus before journaling.

---

## 🚀 Key Prototype Features Built

* ** Cathedrals & Rain Soundscapes (Web Audio API Synthesizer):**
  A high-end, self-contained synth built with native browser Audio Nodes. It generates a swelling cathedral chorus pad (in C/F Major progressions) modulated by a slow LFO and delayed feedback, alongside soft filtered rain sounds. **Zero asset footprint, zero copyright overhead.**
* **Interactive Guided Daily Examen Stepper:**
  A beautiful 5-step prayer journal (Gratitude, Petition, Review, Forgiveness, Resolve) with a progress bar and Ignatian citations that saves logs locally.
* **Ignatian Discernment Coach:**
  Allows users to formulate a major choice, add weighted *Consolations* (peace/charity indicators) and *Desolations* (anxiety/dryness indicators), and calculates a dynamic balance score.
* **Pattern-Matching Socratic Reflection Companion:**
  A client-side analysis engine that reads user entries, checks for emotional states (e.g., money, fear, exhaustion, peace), and surfaces deep Socratic questions mapped directly to St. Ignatius's guidelines for spiritual discernment.
* **Spiritual Exercises Notebook:**
  An educational guide to the 4 "Weeks" of the Exercises with suggested scripture passages and custom journaling logs.

---

## 🛠️ How to Run & Show Off the App

1. **Open Directly in Browser:**
   Simply double-click the `index.html` file or run a local static server inside the directory:
   ```bash
   # If you have Python installed
   python -y -m http.server 8000
   
   # Or using Node.js
   npx -y serve
   ```
2. **Presenting to a Client:**
   * **Step 1:** Open the **Pitch Hub** tab to explain *why* you built it and how it can be adapted.
   * **Step 2:** Toggle on the **Ambient Pad** in the bottom left. The slow, warm swelling chord instantly sets a premium, respectful tone.
   * **Step 3:** Walk them through a **Daily Examen** session, showing the history tab at the end.
   * **Step 4:** Navigate to the **Discernment Coach**, write down a decision (e.g., *"Should I take a new job role?"*), add a consolation like *"sense of service"* (+5) and a desolation like *"anxious about income"* (-3), click **Analyze**, and show how the Socratic Companion challenges the user to reflect deeper.

---

## 🔮 Production Add-Ons You Can Upsell

When a client shows interest in the prototype, you can upsell these production-grade features:

1. **Live Gemini AI Integration (Google Antigravity SDK):**
   Replace the pattern-matching Socratic coach with a secure, serverless Gemini API pipeline. Use prompt tuning trained on the official text of the *Spiritual Exercises*, the letters of St. Ignatius, and contemporary theological papers to provide rich, contextual prompts.
2. **Shared Parish Laudato Si' Boards:**
   Extend the app to include **CommonHome** (parish action tracking). Create collaborative community boards (built with Supabase or Firestore) where families can track carbon footprints, join volunteer tasks, and log parish milestones.
3. **Retreatant-Director Secure Vault:**
   Retreat centers frequently assign "Spiritual Directors" to retreatants. You can upsell a secure messaging portal where retreatants can selectively choose to share specific Examen or Exercise logs with their director for discussion during meetings.
