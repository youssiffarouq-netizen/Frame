import { useContext, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { TitleCard } from "../components/titleCard/TitleCard";
import axios from "axios";
import { authCreatedContext } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";

const text = "text-(--Text) dark:text-(--dark-text)";
const muted = "text-(--Muted) dark:text-(--dark-muted)";
const line = "border-(--Border) dark:border-(--dark-border)";

const PAGE_SIZE = 10;

type SuggestedUser = {
  _id: string;
  name: string;
  username: string;
  photo?: string;
  followersCount?: number;
};

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`font-display grid size-8 shrink-0 place-items-center rounded-full bg-(--Border) text-sm font-bold dark:bg-(--dark-border) ${text}`}
    >
      {name.charAt(0)}
    </span>
  );
}

function WhoToFollow() {
  const { token } = useContext(authCreatedContext);
  const [query, setQuery] = useState("");
  const [following, setFollowing] = useState<string[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["suggestedUsers", token],
    queryFn: async () => {
      const response = await axios.get(
        "https://route-posts.routemisr.com/users/suggestions?limit=50",
        {
          headers: { token },
        },
      );

      return response.data;
    },
    enabled: !!token,
    refetchInterval: 1000 * 60 * 5,
  });

  const people: SuggestedUser[] =
    data?.data?.suggestions ??
    data?.suggestions ??
    data?.data?.users ??
    data?.users ??
    [];

  // search runs on ALL loaded users
  const matches = people.filter((person) =>
    `${person.name} ${person.username}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  // but only the first `visible` results are rendered
  const shown = matches.slice(0, visible);
  const hasMore = matches.length > visible;

  function toggleFollow(id: string) {
    setFollowing((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <TitleCard>
      <div className="flex items-center justify-between ">
        <h2 className={`font-display font-semibold italic ${text}`}>
          Who to follow
        </h2>

        <span
          className={`font-typewriter border px-2 text-xs ${line} ${muted}`}
        >
          {people.length}
        </span>
      </div>

      <label
        className={`font-typewriter mt-3 flex items-center gap-2 border px-3 py-2 text-sm focus-within:border-(--Accent) dark:focus-within:border-(--dark-accent) ${line} ${muted}`}
      >
        <IoSearchOutline className="shrink-0" />

        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE); // new search starts back at 10
          }}
          placeholder="Search people..."
          className={`w-full bg-transparent outline-none placeholder:text-(--Muted) dark:placeholder:text-(--dark-muted) ${text}`}
        />
      </label>

      <ul className="mt-2">
        {isLoading && (
          <li className={`border-t py-3 text-sm ${line} ${muted}`}>
            Loading people...
          </li>
        )}

        {!token && (
          <li className={`border-t py-3 text-sm ${line} ${muted}`}>
            Sign in to discover people.
          </li>
        )}

        {isError && (
          <li className={`border-t py-3 text-sm ${line} ${muted}`}>
            Failed to load people.{" "}
            {axios.isAxiosError(error)
              ? error.response?.status === 401
                ? "Please sign in again."
                : "Please try again later."
              : ""}
          </li>
        )}

        {!isLoading &&
          !isError &&
          token &&
          shown.map((person) => {
            const isFollowing = following.includes(person._id);

            return (
              <li
                key={person._id}
                className={`flex items-center gap-2 border-t py-3 ${line}`}
              >
                <Avatar name={person.name} photo={person.photo} />

                <div className="min-w-0 flex-1">
                  <p className={`font-typewriter truncate text-sm ${text}`}>
                    {person.name}
                  </p>

                  <p className={`font-typewriter truncate text-xs ${muted}`}>
                    @{person.username.replace(/^@/, "")}
                  </p>

                  <p className={`font-typewriter text-xs ${muted}`}>
                    {person.followersCount ?? 0} followers
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFollow(person._id)}
                  aria-pressed={isFollowing}
                  className={`font-typewriter border px-2.5 py-1 text-xs transition-colors ${
                    isFollowing
                      ? "border-(--Accent) bg-(--Accent) text-(--On-accent) dark:border-(--dark-accent) dark:bg-(--dark-accent) dark:text-(--dark-on-accent)"
                      : `${line} ${text} hover:border-(--Accent) dark:hover:border-(--dark-accent)`
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </li>
            );
          })}

        {!isLoading && !isError && token && shown.length === 0 && (
          <li
            className={`font-typewriter border-t py-3 text-sm ${line} ${muted}`}
          >
            No people found.
          </li>
        )}
      </ul>

      {!isLoading && !isError && token && hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className={`font-typewriter mt-3 w-full border px-3 py-2 text-sm transition-colors hover:border-(--Accent) dark:hover:border-(--dark-accent) ${line} ${text}`}
        >
          Load more ({matches.length - visible} left)
        </button>
      )}
    </TitleCard>
  );
}

export default function Search() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-5 pb-28 md:px-6 md:pb-10 ">
      <WhoToFollow />
    </div>
  );
}
