import { Moon, Sun } from "lucide-react"
import { useTheme } from "./useTheme"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button onClick={toggleTheme} className="relative flex">
      <Sun
        className={`h-5 w-5 transition-all ${
          theme === "light" ? "scale-100 rotate-0" : "scale-0 -rotate-90"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all ${
          theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
