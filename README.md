# LifeOS - Your Personal AI Assistant

LifeOS is a high-performance, intelligent personal organizer designed to bridge the gap between human intention and actionable organization. Powered by Google's Gemini API, it transforms unstructured data—text, voice, and images—into a structured productivity system.

## 🚀 Key Features

- **AI Task Extraction**: Intelligently parses natural language, voice transcripts, and images (e.g., photos of whiteboard notes or handwritten lists) to create structured tasks with priorities and categories.
- **Smart Reminders**: Integrated browser-level Web Notifications that alert you to tasks due today, ensuring nothing falls through the cracks.
- **Monthly Interactive Calendar**: A full-grid visual planner to manage your long-term schedule and track task density across the month.
- **Audit Dashboard**: Real-time productivity analytics, featuring a "Life Balance Score" and category distribution visualizations.
- **Lumina Dark Mode**: A premium "Onyx" aesthetic designed for low-light conditions, featuring seamless transitions and high-contrast readability.
- **Enhanced Progress Visualization**: Tasks with subtasks now feature prominent percentage badges, completion step counters (e.g., "2 / 5 steps"), and thick, aesthetic progress bars with indigo gradients.
- **AI Subtask Breakdown**: Uses the "Breakdown" feature to decompose complex tasks into manageable, actionable steps.
- **Morning Briefing**: Generates concise, encouraging summaries of your upcoming day based on your current agenda.
- **Vision Board**: Generates aesthetic AI-driven visualizations of your top priorities to keep you inspired and focused.
- **Grounding Integration**: Leverages Google Search and Maps grounding to provide verified source links and location data for relevant queries.

## 🛠 Tech Stack

- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS (Dark Mode class strategy)
- **AI Engine**: 
  - `gemini-3-flash-preview` (Reasoning, Task Extraction, Summarization)
  - `gemini-2.5-flash-image` (Vision Board Generation)
- **Browser APIs**:
  - Notification API (Reminders)
  - Web Speech API (Speech-to-Text)
  - LocalStorage (Persistence)

## 📁 Project Structure

- `/App.tsx`: Central orchestrator for state, theme, and application logic.
- `/types.ts`: Type definitions for Tasks, Messages, and Enums.
- `/services/geminiService.ts`: Specialized service for interacting with the Google GenAI SDK, handling prompt engineering and response schema validation.
- `/components/`:
  - `TaskCard.tsx`: Interactive task items with progress tracking and subtask management.
  - `CalendarView.tsx`: Monthly grid calendar with navigation and density indicators.
  - `AuditDashboard.tsx`: Analytics and productivity scoring.
  - `InputArea.tsx`: Multi-modal input center (Text/Image/Voice).

## 💡 Usage

Simply talk to LifeOS in the chat. Try commands like:
- "I need to call the dentist tomorrow at 2pm"
- "Show me a morning briefing"
- "Visualize my day with a vision board"
- Upload a photo of your fridge and say "Suggest some groceries to buy based on what's missing"
