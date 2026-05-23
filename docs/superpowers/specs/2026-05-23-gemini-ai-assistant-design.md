# Design Spec: Gemini AI Viticulture Assistant & Variety Analyzer

Specification for integrating a client-side Gemini 1.5 Flash AI assistant into the smart-vineyard static application. This tool enables dynamic analysis of grape varieties not present in the default 122-variety database, compatibility testing against local CAT values, and an interactive chat interface for general viticulture and agronomy questions.

---

## 1. Goal Description
The objective is to provide a smart chat and analytical assistant for vineyard planning. The user should be able to:
1. Enter their Gemini API key securely (either manually or via a single-use URL link).
2. Input any grape variety name to fetch its characteristics via the Gemini API, evaluate if it is compatible with the local climate (using CAT/SAT ranges), and optionally save it to a local list of planting candidates.
3. Open a general-purpose chat interface to ask viticultural, pruning, pest control, and fertilization questions in Ukrainian.
4. Keep the entire solution static and browser-only (no backend servers required).

---

## 2. Technical Architecture & Data Flow

### A. API Connection & Key Security
- **Key Retrieval**: The application checks for a `gemini_key` query parameter in the URL (e.g. `?gemini_key=AIzaSy...`).
- **Key Storage**: If found, it saves the key in `localStorage` under `viticulture-gemini-key`.
- **URL Sanitation**: The script instantly strips the key from the URL query string using `history.replaceState` to prevent key leakage in browser history or screenshots.
- **Client-Side Fetch**: The application communicates directly with Google's official Gemini endpoint:
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

### B. Mode 1: Structured Variety Analyzer
1. **User input**: Variety name (string, e.g., "Каберне Кортіс").
2. **AI Request**: Requests a JSON payload containing ripening days, color, taste, average weight, seed status, care recommendations, and estimated required CAT.
3. **JSON Constraint**: The prompt instructs Gemini to output *only* raw JSON.
4. **Suitability Check**: Once parsed, the app runs the local CAT check logic (`getCatInfoByRip` and comparison against the region's SAT) and shows the result card.
5. **Database Saving**: Allows the user to click "Зберегти в кандидати", adding it to a `viticulture-ai-candidates` JSON array in `localStorage`.

### C. Mode 2: General Viticulture Chat
- **System Instruction**:
  > "Ти — досвідчений український агроном-консультант, експерт з виноградарства. Відповідай чітко, структуровано, українською мовою. Твої поради мають бути практичними, адаптованими під клімат України, з акцентом на безпечне застосування препаратів (ЗЗР) та добрив."
- **Message History**: Keeps a short-term conversational context in JS state (up to 15 turns) to enable conversational follow-up.

---

## 3. UI/UX Design

### Tab Layout (`#tab-ai-assistant`)
We will create a new navigation button in the main header:
`<button onclick="switchTab('ai-assistant')" id="nav-ai-assistant" class="nav-btn ...">🔬 AI Помічник</button>`

The tab will have:
1. **Status Banner**:
   - Status indicators showing if the AI connection is active.
   - A configuration card where the user can copy the auto-setup URL or manually manage/delete their API key.
2. **Main Layout**: Two-column layout on large screens (`grid grid-cols-1 lg:grid-cols-12 gap-8`):
   - **Left Column (col-span-7)**:
     - Toggle between "🔍 Аналіз нового сорту" and "💬 Запитати агронома".
     - In **Analyzer Mode**: Simple search input and action button.
     - In **Chat Mode**: A beautiful chat transcript window with styled bubbles (user vs AI) and a send button with loading spinners.
   - **Right Column (col-span-5)**:
     - **"Мої кандидати на посадку"**: List of saved varieties, showing their estimated ripening days, necessary CAT, and local climate status. Allows clicking a candidate to view full details or delete it.

---

## 4. Prompt Specifications

### Variety Analysis System Instruction
```
Знайди детальну агрономічну інформацію про сорт винограду "{Variety Name}".
Поверни відповідь виключно у форматі JSON із такими полями (мовою відповіді має бути українська):
{
  "name": "Назва сорту українською",
  "rip": "кількість днів дозрівання (наприклад: '110-115 дн.')",
  "col": "колір ягоди: 'W' (білий), 'R' (червоний/рожевий), 'B' (чорний/синій)",
  "taste": "опис смаку (наприклад: 'Мускат з тонами шавлії')",
  "bunch": "середня вага грона (наприклад: '600-1000 г')",
  "seed": "наявність кісточок: 'З кіст.' або 'Безкіст.'",
  "care": "короткі особливості догляду та вразливості сорту (до 150 символів)",
  "sat_required": "необхідна сума активних температур (число, наприклад: 2100)"
}
Якщо такий сорт не існує або це не виноград, поверни JSON з полем "error": "Сорт не знайдено".
```

---

## 5. Verification Plan

### Automated Verification
- Verify syntax correctness for both `index.html` and `index_clean.html` using node script checks.
- Test JSON parsing limits and API error boundary handling (e.g. invalid API key, offline mode, non-existent variety name).

### Manual Verification
- Verify the auto-setup URL behavior (query parameter parsed, saved to `localStorage`, URL cleaned).
- Test layout responsiveness on mobile devices (single-column stack) and desktop screens.
