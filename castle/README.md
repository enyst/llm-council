# 🏰 Castle Library LLM Oracle

A mystical library-themed application where you summon ancient tomes (LLMs) from enchanted shelves to answer your questions.

## ✨ Features

### 🏰 Castle Library Atmosphere
- **Stone walls and gothic architecture** with arched alcoves
- **Flickering torches** on the walls with realistic flame animations
- **Floating dust particles** drifting through the air
- **Candles** on the reading desk with glowing effects
- **Rich amber, gold, and deep brown color palette**

### 📚 Book Selection from the Shelf
- **Ancient tomes on a wooden bookshelf** representing each LLM
- **Pull animation** - books slide up when selected
- **Glowing effects** for selected books
- **Hover tooltips** with model descriptions
- **Books appear open on the reading desk** when selected

### 💬 The Consultation Chamber
- **Parchment-style messages** for AI responses
- **Wax-sealed messages** for user input
- **Each model has unique colors and icons**
- **Loading states** with thematic text ("consulting ancient texts...")

### 🔄 Multi-Model Discourse
- Select **multiple oracles** simultaneously
- Each answers your question in turn
- They then **review each other's responses** with thoughtful commentary
- Reviews are visually distinguished with side borders

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the castle directory:
```bash
cd castle
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Use

1. **Pull books from the shelf** - Click on the ancient tomes in the alcove to select them
2. **Selected books appear on the reading desk** - You'll see them open on the wooden desk
3. **Click desk books to return them** to the shelf if you change your mind
4. **Type on the parchment** - Enter your question in the text area
5. **Press Enter or click "Summon Wisdom"** to submit your query
6. **Watch as oracles respond** - If you selected multiple models, they'll each answer and then review each other's responses!

## 🎨 Available Oracles

### 📖 The Sage of Anthropic
*Ancient wisdom wrapped in thoughtful analysis and careful reasoning*

### 🔮 The Oracle of OpenAI
*Versatile knowledge flowing from the emerald tower of creation*

### ⚗️ The Dual Mind of Gemini
*Twin perspectives merging from the sapphire depths of knowledge*

## 🔮 Future Enhancements

Currently, the application uses mock responses to demonstrate the UI and interaction flow. To connect to real LLM providers:

1. Set up API keys for Anthropic, OpenAI, and Google
2. Create API routes in `app/api/`
3. Update the `generateResponse` and `generateReview` functions to call real APIs

## 📦 Project Structure

```
castle/
├── app/
│   ├── page.tsx          # Main Castle Library component
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles with Tailwind
├── public/               # Static assets
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── next.config.js        # Next.js configuration
```

## 🛠️ Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management
- **CSS Animations** - Smooth, themed animations

## 📝 License

This project is part of the llm-council repository.

---

✧ *Within these ancient halls, wisdom echoes through eternity* ✧
