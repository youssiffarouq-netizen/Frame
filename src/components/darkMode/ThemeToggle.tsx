import { Moon, Sun } from "@gravity-ui/icons";
import { useDarkMode } from "./Darkmode";

export function ThemeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={toggle}
      className="relative h-9 w-16 shrink-0 cursor-pointer border border-(--Accent) bg-(--Card) transition-colors duration-300 dark:border-(--dark-border) dark:bg-(--Dark-card)"
    >
      <span
        className={`absolute top-0.75 left-0.75 grid size-7 place-items-center bg-(--Accent) text-(--On-accent) transition-transform duration-300 dark:bg-(--dark-accent) dark:text-(--dark-on-accent) ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </span>
    </button>
  );
}
