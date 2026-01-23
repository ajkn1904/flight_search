# 🛫 AERO FIND - A Flight Search Engine

A responsive **Flight Search Engine** built with **React**, **TypeScript**, and **ShadCN UI**. This project allows users to search for flights, filter results, view price trends, and toggle between light and dark themes. It integrates with the **Amadeus Self-Service API** for real flight data.

### Visit: [AERO FIND](https://aero-find.vercel.app/)

---

## 🛠️ Technology Stack  

| Category | Tools |
|---------|-------|
| ⚛️ Library | React.js |
| 🧠 Language | TypeScript |
| 🎨 Styling | Tailwind CSS, shadcn/ui |
| 🔄 State Management | React useState, useEffect, useMemo |
| ⚙️ Build Tool | Vite |
| ♾️ API Integration | [Amadeus Self-Service API](https://developers.amadeus.com/) |
| 🚀 Deployment | Vercel |
| 🧹 Linting | ESLint, Prettier |
| 📦 Others | React Router, date-fns, Axios/Fetch, Lucide-react (icons) |

---

## ✨ Features

- **Flight Search**: Search flights between cities with options for one-way or round-trip.
- **Passenger Selection**: Select number of adults, children, and infants.
- **Flight Class Selection**: Economy, Premium Economy, Business, and First Class.
- **Location Autocomplete**: Suggests cities and airports while typing.
- **Date Selection**: Choose departure and return dates.
- **Filters**:
  - Price range slider with current min/max values.
  - Stops filter (Direct, 1 Stop, 2 Stops).
  - Sort by price (Lowest / Highest).
  - Airlines filter with checkboxes.
- **Price Graph**: Visual representation of flight prices over time.
- **Theme Toggle**: Switch between Light and Dark mode instantly with smooth icon animation.
- **Popular Routes**: Quick select badges for common flight routes.



---

## 🧱 Installation & Setup Process

### CLI Commands :----------

```
- bun create vite
- bun install
- bun add react-router
- bun add tailwindcss @tailwindcss/vite
- bun add -D @types/node
- bunx --bun shadcn@latest init
- bun add axios
```

### At `index.css` :----------
```css
@import "tailwindcss";
```

### At `tsconfig.json` :----------

```json
// ...,
"compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
// ...
```

### At `tsconfig.app.json` :----------

```json
"compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
}
```

## At `vite.config.ts` :----------

```ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```
