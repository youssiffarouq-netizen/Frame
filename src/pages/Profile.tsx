import { useContext } from "react";
import { Link } from "react-router-dom";
import { IoConstructOutline } from "react-icons/io5";

import { TitleCard } from "../components/titleCard/TitleCard";
import { authCreatedContext } from "../../context/AuthContext";

const text = "text-(--Text) dark:text-(--dark-text)";
const muted = "text-(--Muted) dark:text-(--dark-muted)";
const accentBtn =
  "bg-(--Accent) text-(--On-accent) hover:bg-(--Accent-hover) dark:bg-(--dark-accent) dark:text-(--dark-on-accent) dark:hover:bg-(--dark-accent-hover)";

export default function Profile() {
  const { token } = useContext(authCreatedContext);

  const target = token
    ? { to: "/home", label: "Back to feed" }
    : { to: "/signup", label: "Sign up" };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-5 pb-28 md:px-6 md:pb-10">
      <TitleCard innerClassName="p-0! sm:p-0!">
        <div className="flex min-h-[calc(100dvh-12.75rem)] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[calc(100dvh-8.25rem)]">
          <IoConstructOutline className="text-5xl text-(--Accent) dark:text-(--dark-accent)" />

          <h1 className={`font-display text-3xl font-semibold italic ${text}`}>
            Under construction
          </h1>

          <p className={`font-typewriter text-sm ${muted}`}>
            This frame is still developing.
          </p>

          {/* caution tape */}
          <div
            aria-hidden="true"
            className="my-3 h-2.5 w-full max-w-xs bg-[repeating-linear-gradient(45deg,var(--Accent)_0_10px,transparent_10px_20px)] dark:bg-[repeating-linear-gradient(45deg,var(--dark-accent)_0_10px,transparent_10px_20px)]"
          />

          <p
            className={`font-typewriter max-w-sm text-sm leading-relaxed ${muted}`}
          >
            We're still working on this page. Check back soon, it'll be worth
            the wait.
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
