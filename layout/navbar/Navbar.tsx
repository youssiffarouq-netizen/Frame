import { Popover, Button } from "@heroui/react";
import { ThemeToggle } from "../../src/components/darkMode/ThemeToggle";
import ComposerModal from "../../src/components/Createpost";
import { FaInfoCircle } from "react-icons/fa";
import {
  IoAdd,
  IoFilm,
  IoFilmOutline,
  IoNotifications,
  IoNotificationsOutline,
  IoPerson,
  IoPersonOutline,
  IoSearch,
  IoSearchOutline,
} from "react-icons/io5";
import { useContext, useState } from "react";
import { authCreatedContext } from "../../context/AuthContext";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import style from "./navbar.module.css";

/* links shown in the top bar from md (768px) */
const topLinks = [
  { to: "/home", label: "Feed", Icon: IoFilmOutline, ActiveIcon: IoFilm },
  {
    to: "/search",
    label: "Search",
    Icon: IoSearchOutline,
    ActiveIcon: IoSearch,
  },
  {
    to: "/profile",
    label: "Profile",
    Icon: IoPersonOutline,
    ActiveIcon: IoPerson,
  },
  {
    to: "/notifications",
    label: "Notifications",
    Icon: IoNotificationsOutline,
    ActiveIcon: IoNotifications,
  },
];

/* phone tab bar. null is the raised "Frame it" button.
   "Frames" (/my-frames) is left out until that page exists. */
const tabs = [
  { to: "/home", label: "Feed", Icon: IoFilmOutline, ActiveIcon: IoFilm },
  {
    to: "/search",
    label: "Search",
    Icon: IoSearchOutline,
    ActiveIcon: IoSearch,
  },
  null,
  {
    to: "/notifications",
    label: "Alerts",
    Icon: IoNotificationsOutline,
    ActiveIcon: IoNotifications,
  },
  { to: "/profile", label: "Me", Icon: IoPersonOutline, ActiveIcon: IoPerson },
];

/* About popover: only used on the login / signup header now */
function AboutPopover() {
  return (
    <Popover>
      <Button
        variant="secondary"
        aria-label="About Frame"
        className="bg-(--page) text-(--Accent) border border-(--Accent) rounded-none p-3 hover:bg-(--Accent-hover) hover:text-(--On-accent) transition-colors dark:bg-(--dark-page) dark:text-(--dark-accent) dark:border-(--dark-accent) dark:hover:bg-(--dark-accent-hover) dark:hover:text-(--dark-on-accent)"
      >
        <FaInfoCircle className="text-current" />
      </Button>

      <Popover.Content
        className="z-60 w-[min(390px,92vw)] rounded-sm border border-(--Border) bg-(--Card) p-1.25 shadow-[0_8px_30px_0_var(--myShadow)] dark:border-(--dark-border) dark:bg-(--Dark-card) dark:shadow-[0_0_20px_0_var(--mydark-shadow)]"
        placement="bottom end"
        offset={12}
      >
        <Popover.Dialog className="border border-(--Border) p-0 outline-none dark:border-(--dark-border) dark:bg-(--Dark-card)">
          <div className="px-6 pt-5 pb-4">
            <p
              className={`${style.label} text-(--Muted) dark:text-(--dark-muted)`}
            >
              About Frame
            </p>

            <h2 className="font-display my-3 text-3xl font-bold leading-tight text-(--Text) dark:text-(--dark-text)">
              No noise. Just frames.
            </h2>

            <p className="font-typewriter text-[13px] leading-relaxed text-(--Muted) dark:text-(--dark-muted)">
              Frame is a social space built around the moments that matter.
              Frame what you're seeing, like what moves you, and follow the
              people you never want to lose track of. No noise, no clutter, just
              the story as it unfolds, one frame after another.
            </p>

            <p className="font-display mt-4 italic text-(--Text) dark:text-(--dark-text)">
              Frame it, and let the story roll.
            </p>
          </div>

          <div className="flex divide-x divide-(--Border) border-t border-(--Border) dark:divide-(--dark-border) dark:border-(--dark-border)">
            {[
              ["Frame", "Capture a moment"],
              ["Like", "Back a good frame"],
              ["Follow", "Keep up with people"],
            ].map(([title, sub]) => (
              <div key={title} className="flex-1 px-1.5 py-3 text-center">
                <div className="font-display text-lg font-semibold italic text-(--Text) dark:text-(--dark-text)">
                  {title}
                </div>
                <div className="font-typewriter text-[11px] text-(--Muted) dark:text-(--dark-muted)">
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function AuthHeader() {
  return (
    <header className="relative z-10 w-full shrink-0 border-b border-(--Border) bg-(--page) dark:border-(--dark-border) dark:bg-(--dark-page) lg:dark:bg-(--Dark-card)">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-20">
        <h1 className="font-display flex items-center gap-2 text-3xl font-extrabold leading-none text-(--Accent) md:text-4xl lg:text-5xl dark:text-(--dark-accent)">
          <IoFilm
            aria-hidden="true"
            className="text-2xl md:text-3xl lg:text-4xl"
          />
          Frame
        </h1>

        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />
          <AboutPopover />
        </div>
      </div>
    </header>
  );
}

function topLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 border-b-2 px-1 pb-1 transition-colors ${
    isActive
      ? "border-(--Accent) text-(--Accent) dark:border-(--dark-accent) dark:text-(--dark-accent)"
      : "border-transparent text-(--Muted) hover:text-(--Accent) dark:text-(--dark-muted) dark:hover:text-(--dark-accent)"
  }`;
}

function AppHeader() {
  const navigate = useNavigate();
  const { removeTokenValue } = useContext(authCreatedContext);

  function logout() {
    removeTokenValue();
    navigate("/auth", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-(--Border) bg-(--page) lg:static dark:border-(--dark-border) dark:bg-(--dark-page) lg:dark:bg-(--Dark-card)">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-20">
        <Link
          to="/home"
          className="font-display text-3xl font-extrabold text-(--Accent) md:text-4xl lg:text-5xl dark:text-(--dark-accent)"
        >
          Frame
        </Link>

        <nav
          aria-label="Primary"
          className="font-typewriter hidden items-center gap-5 text-sm md:flex"
        >
          {topLinks.map(({ to, label, Icon, ActiveIcon }) => (
            <NavLink key={to} to={to} className={topLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <ActiveIcon className="text-lg" />
                  ) : (
                    <Icon className="text-lg" />
                  )}
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="border-3 border-(--Accent) text-(--Accent) px-3 py-0.5 cursor-pointer hover:bg-(--Error) hover:text-white transition-all duration-200 dark:bg-(--dark-accent) dark:border-(--Border) dark:hover:bg-(--Error)"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}

/* logged in, phones only (under 768px) */
function MobileTabBar() {
  // The tab bar owns its own composer modal, so it works without any provider.
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-around border-t border-(--Border) bg-(--page) pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden dark:border-(--dark-border) dark:bg-(--dark-page)"
      >
        {tabs.map((tab, i) =>
          tab ? (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `font-typewriter -mt-px flex min-w-14 flex-col items-center gap-0.5 border-t-2 px-1 pt-2 pb-1 text-[11px] transition-colors ${
                  isActive
                    ? "border-(--Text) text-(--Text) dark:border-(--dark-text) dark:text-(--dark-text)"
                    : "border-transparent text-(--Muted) dark:text-(--dark-muted)"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <tab.ActiveIcon className="text-2xl" />
                  ) : (
                    <tab.Icon className="text-2xl" />
                  )}
                  {tab.label}
                </>
              )}
            </NavLink>
          ) : (
            <button
              key={`frame-it-${i}`}
              type="button"
              aria-label="Frame it"
              onClick={() => setComposerOpen(true)}
              className="-mt-6 mb-1 grid size-14 place-items-center border-4 border-(--page) bg-(--Accent) text-(--On-accent) transition-colors hover:bg-(--Accent-hover) dark:border-(--dark-page) dark:bg-(--dark-accent) dark:text-(--dark-on-accent) dark:hover:bg-(--dark-accent-hover)"
            >
              <IoAdd className="text-3xl" />
            </button>
          ),
        )}
      </nav>

      <ComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </>
  );
}

export default function Navbar() {
  const { token } = useContext(authCreatedContext);
  const { pathname } = useLocation();

  const loggedIn = Boolean(token) && pathname !== "/auth";

  if (!loggedIn) return <AuthHeader />;

  return (
    <>
      <AppHeader />
      <MobileTabBar />
    </>
  );
}
