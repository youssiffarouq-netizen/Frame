import { useContext } from "react";
import { Link } from "react-router-dom";
import { IoFilmOutline } from "react-icons/io5";

import { TitleCard } from "../components/titleCard/TitleCard";
import { authCreatedContext } from "../../context/AuthContext";

const text = "text-(--Text) dark:text-(--dark-text)";
const muted = "text-(--Muted) dark:text-(--dark-muted)";
const accentBtn =
  "bg-(--Accent) text-(--On-accent) hover:bg-(--Accent-hover) dark:bg-(--dark-accent) dark:text-(--dark-on-accent) dark:hover:bg-(--dark-accent-hover)";

export default function NotFound() {
  const { token } = useContext(authCreatedContext);

  const target = token
    ? { to: "/home", label: "Back to feed" }
    : { to: "/auth", label: "Sign up" };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-5 pb-28 md:px-6 md:pb-10">
      <TitleCard innerClassName="p-0! sm:p-0!">
        <div className="flex min-h-[calc(100dvh-12.75rem)] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[calc(100dvh-8.25rem)]">
          <IoFilmOutline className="text-5xl text-(--Accent) dark:text-(--dark-accent)" />

          <p
            className={`font-display text-7xl font-semibold italic leading-none ${text}`}
          >
            404
          </p>

          <h1 className={`font-display text-2xl italic ${text}`}>
            Page not found
          </h1>

          <p
            className={`font-typewriter max-w-sm text-sm leading-relaxed ${muted}`}
          >
            This frame is missing from the reel. The page you're looking for
            doesn't exist or has been moved.
          </p>

          <Link
            to={target.to}
            className={`font-typewriter mt-4 px-6 py-2.5 text-sm font-bold transition-colors ${accentBtn}`}
          >
            {target.label}
          </Link>
        </div>
      </TitleCard>
    </div>
  );
}
