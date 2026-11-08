import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoAt,
  IoChatbubble,
  IoCheckmarkDone,
  IoHeart,
  IoNotifications,
  IoNotificationsOutline,
  IoPersonAdd,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { TitleCard } from "../components/titleCard/TitleCard";
import { UserAvatar } from "../components/Createpost";
import { authCreatedContext } from "../../context/AuthContext";

const text = "text-(--Text) dark:text-(--dark-text)";
const muted = "text-(--Muted) dark:text-(--dark-muted)";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type NotificationType = "like" | "comment" | "follow" | "mention" | "other";

interface NotificationItem {
  id: string;
  type: NotificationType;
  actor: { name: string; photo?: string };
  postId?: string;
  postImage?: string;
  excerpt?: string; // comment / mention text
  createdAt: string; // ISO date
  read: boolean;
}

/* What the API returns for each notification */
interface ApiNotification {
  _id: string;
  type: string; // e.g. "like_post"
  isRead: boolean;
  createdAt: string;
  actor?: { _id: string; name: string; photo?: string };
  entityId?: string;
  entityType?: string; // e.g. "post"
  entity?: {
    _id?: string;
    image?: string;
    body?: string;
    content?: string; // when the entity is a comment
    post?: string;
  };
}

function mapType(apiType: string): NotificationType {
  const t = apiType.toLowerCase();
  if (t.includes("like")) return "like";
  if (t.includes("comment") || t.includes("reply")) return "comment";
  if (t.includes("follow")) return "follow";
  if (t.includes("mention")) return "mention";
  return "other";
}

function mapNotification(n: ApiNotification): NotificationItem {
  const type = mapType(n.type);
  return {
    id: n._id,
    type,
    actor: { name: n.actor?.name ?? "Someone", photo: n.actor?.photo },
    postId:
      n.entityType === "post" ? n.entityId : (n.entity?.post ?? undefined),
    postImage: n.entity?.image,
    excerpt:
      type === "comment" || type === "mention" ? n.entity?.content : undefined,
    createdAt: n.createdAt,
    read: n.isRead,
  };
}

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const badgeStyle = "bg-(--Accent) text-(--On-accent)";

const typeConfig: Record<
  NotificationType,
  { Icon: IconType; verb: string; badge: string }
> = {
  like: { Icon: IoHeart, verb: "liked your frame", badge: badgeStyle },
  comment: {
    Icon: IoChatbubble,
    verb: "commented on your frame",
    badge: badgeStyle,
  },
  follow: {
    Icon: IoPersonAdd,
    verb: "started following you",
    badge: badgeStyle,
  },
  mention: {
    Icon: IoAt,
    verb: "mentioned you in a frame",
    badge: badgeStyle,
  },
  other: {
    Icon: IoNotifications,
    verb: "sent you a notification",
    badge: badgeStyle,
  },
};

type Filter = "all" | "unread" | "like" | "comment" | "follow";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "like", label: "Likes" },
  { key: "comment", label: "Comments" },
  { key: "follow", label: "Follows" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-us", {
    day: "numeric",
    month: "short",
  });
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/* ------------------------------------------------------------------ */
/* One notification row                                                */
/* ------------------------------------------------------------------ */
function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const { Icon, verb, badge } = typeConfig[item.type];
  const to = item.postId ? `/postInfo/${item.postId}` : "/community";

  return (
    <Link
      to={to}
      onClick={() => onRead(item.id)}
      className={`flex items-start gap-3 border-l-4 p-3 transition-colors hover:bg-(--Card) dark:hover:bg-(--Dark-card) ${
        item.read
          ? "border-transparent"
          : "border-(--Accent) bg-(--Card)/60 dark:border-(--dark-accent) dark:bg-(--Dark-card)/60"
      }`}
    >
      {/* avatar + type badge */}
      <div className="relative shrink-0">
        <UserAvatar
          name={item.actor.name}
          photo={item.actor.photo}
          size="size-11"
        />
        <span
          className={`absolute -right-1 -bottom-1 flex size-5 items-center justify-center text-[11px] ${badge}`}
        >
          <Icon />
        </span>
      </div>

      {/* text */}
      <div className="min-w-0 flex-1">
        <p className={`font-typewriter text-sm leading-relaxed ${text}`}>
          <span className="font-display font-semibold italic">
            {item.actor.name}
          </span>{" "}
          <span className={muted}>{verb}</span>
        </p>
        {item.excerpt && (
          <p
            className={`font-typewriter mt-1 line-clamp-2 border-l border-(--Border) ps-2 text-xs dark:border-(--dark-border) ${muted}`}
          >
            {item.excerpt}
          </p>
        )}
        <p className={`font-typewriter mt-1 text-xs ${muted}`}>
          {timeAgo(item.createdAt)}
        </p>
      </div>

      {/* thumbnail (+ unread dot) */}
      {item.postImage ? (
        <div className="relative shrink-0">
          <img
            src={item.postImage}
            alt=""
            loading="lazy"
            className="size-12 object-cover"
          />
          {!item.read && (
            <span
              aria-label="Unread"
              className="absolute -top-1 -right-1 size-2.5 rounded-full bg-(--Accent) dark:bg-(--dark-accent)"
            />
          )}
        </div>
      ) : (
        !item.read && (
          <span
            aria-label="Unread"
            className="mt-2 size-2.5 shrink-0 rounded-full bg-(--Accent) dark:bg-(--dark-accent)"
          />
        )
      )}
    </Link>
  );
}

function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-3 p-3">
      <div className="size-11 shrink-0 rounded-full bg-(--Border) dark:bg-(--dark-border)" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 w-2/3 rounded bg-(--Border) dark:bg-(--dark-border)" />
        <div className="h-3 w-16 rounded bg-(--Border)/60 dark:bg-(--dark-border)/60" />
      </div>
      <div className="size-12 shrink-0 bg-(--Border) dark:bg-(--dark-border)" />
    </div>
  );
}

function Group({
  title,
  items,
  onRead,
}: {
  title: string;
  items: NotificationItem[];
  onRead: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2
        className={`font-typewriter px-3 pb-1 pt-3 text-xs uppercase tracking-widest ${muted}`}
      >
        {title}
      </h2>
      <div className="divide-y divide-(--Border) dark:divide-(--dark-border)">
        {items.map((n) => (
          <NotificationRow key={n.id} item={n} onRead={onRead} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Notifications() {
  const { token } = useContext(authCreatedContext);
  const [filter, setFilter] = useState<Filter>("all");
  // ids the user opened / marked as read during this visit
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  function getNotifications() {
    return axios.get(
      "https://route-posts.routemisr.com/notifications?unread=false&page=1&limit=20",
      { headers: { token } },
    );
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!token,
  });

  // API data -> design items (+ locally marked-as-read ones)
  const items = useMemo<NotificationItem[]>(() => {
    const list: ApiNotification[] = data?.data?.data?.notifications ?? [];
    return list
      .map(mapNotification)
      .map((n) => ({ ...n, read: n.read || readIds.has(n.id) }));
  }, [data, readIds]);

  const unreadCount = items.filter((n) => !n.read).length;

  const visible = useMemo(() => {
    return items
      .filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [items, filter]);

  const today = visible.filter((n) => isToday(n.createdAt));
  const earlier = visible.filter((n) => !isToday(n.createdAt));

  function markRead(id: string) {
    setReadIds((prev) => new Set(prev).add(id));
  }

  function markAllRead() {
    setReadIds(new Set(items.map((n) => n.id)));
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-5 pb-28 md:px-6 lg:pb-10">
      <TitleCard innerClassName="p-0! sm:p-0!">
        {/* header */}
        <header className="flex items-center justify-between gap-3 border-b border-(--Border) p-4 dark:border-(--dark-border)">
          <div className="flex items-center gap-2">
            <h1 className={`font-display text-xl font-semibold italic ${text}`}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="font-typewriter bg-(--Accent) px-2 py-0.5 text-xs font-bold text-(--On-accent) dark:bg-(--dark-accent) dark:text-(--dark-on-accent)">
                {unreadCount} new
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className={`font-typewriter flex cursor-pointer items-center gap-1.5 text-xs transition-colors hover:text-(--Accent) disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-(--dark-accent) ${muted}`}
          >
            <IoCheckmarkDone className="text-base" />
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
        </header>

        {/* filter tabs */}
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="flex gap-1 overflow-x-auto border-b border-(--Border) p-2 dark:border-(--dark-border)"
        >
          {filters.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`font-typewriter shrink-0 cursor-pointer px-3 py-1.5 text-xs transition-colors ${
                filter === key
                  ? "bg-(--Accent) text-(--On-accent) dark:bg-(--dark-accent) dark:text-(--dark-on-accent)"
                  : `${muted} hover:text-(--Text) dark:hover:text-(--dark-text)`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* list */}
        {isLoading ? (
          <div className="divide-y divide-(--Border) dark:divide-(--dark-border)">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        ) : isError ? (
          <p className="py-12 text-center text-(--Error) dark:text-(--dark-error)">
            Could not load notifications.
          </p>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <IoNotificationsOutline className={`text-4xl ${muted}`} />
            <p className={`font-display text-lg italic ${text}`}>
              Nothing on the reel yet
            </p>
            <p className={`font-typewriter text-xs ${muted}`}>
              Likes, comments and new followers will show up here.
            </p>
          </div>
        ) : (
          <>
            <Group title="Today" items={today} onRead={markRead} />
            <Group title="Earlier" items={earlier} onRead={markRead} />
          </>
        )}
      </TitleCard>
    </div>
  );
}
