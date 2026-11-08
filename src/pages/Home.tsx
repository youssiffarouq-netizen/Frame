import { useContext, useRef, useState, type ChangeEvent } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  IoAddOutline,
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoFilmOutline,
  IoGlobeOutline,
  IoHeart,
  IoHeartOutline,
  IoImageOutline,
  IoSearchOutline,
  IoShareSocialOutline,
} from "react-icons/io5";
import axios from "axios";

import { TitleCard } from "../components/titleCard/TitleCard";
import { authCreatedContext } from "../../context/AuthContext";
import {
  UserAvatar,
  useComposer,
  type PostType,
} from "../components/Createpost";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Modal, toast } from "@heroui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";

const text = "text-(--Text) dark:text-(--dark-text)";
const muted = "text-(--Muted) dark:text-(--dark-muted)";
const accentBtn =
  "bg-(--Accent) text-(--On-accent) hover:bg-(--Accent-hover) dark:bg-(--dark-accent) dark:text-(--dark-on-accent) dark:hover:bg-(--dark-accent-hover)";

/* The API returns `likes` (array of user IDs) on each post.
   If your PostType already has it, you can delete this extension. */
type FeedPost = PostType & { likes?: string[] };

/* Shape of what `getPosts` stores in the react-query cache (an axios response). */
type FeedCache = { data: { data: { posts: FeedPost[] } } };

const navItems = [
  { to: "/home", label: "Feed", Icon: IoFilmOutline },
  { to: "/search", label: "Search", Icon: IoSearchOutline },
  { to: "/my-frames", label: "My frames", Icon: IoImageOutline },
  { to: "/community", label: "Community", Icon: IoGlobeOutline },
  { to: "/saved", label: "Saved", Icon: IoBookmarkOutline },
];

function SideNav({ onOpenComposer }: { onOpenComposer: () => void }) {
  return (
    <TitleCard innerClassName="p-2! sm:p-2!">
      <nav aria-label="Main Navigation" className="grid gap-1">
        <button
          type="button"
          onClick={onOpenComposer}
          className={`font-typewriter mb-2 flex w-full cursor-pointer items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold transition-colors ${accentBtn}`}
        >
          <IoAddOutline className="text-lg" />
          Add Frame
        </button>

        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `font-typewriter flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-(--Accent) text-(--On-accent) dark:bg-(--dark-accent) dark:text-(--dark-on-accent)"
                  : `${muted} hover:text-(--Text) dark:hover:text-(--dark-text)`
              }`
            }
          >
            <Icon className="shrink-0 text-base" />
            {label}
          </NavLink>
        ))}
      </nav>
    </TitleCard>
  );
}

/* ------------------------------------------------------------------ */
/* One single edit modal for the whole page (instead of one per post)  */
/* ------------------------------------------------------------------ */
function EditPostModal({
  post,
  onClose,
}: {
  post: PostType | null;
  onClose: () => void;
}) {
  const { token } = useContext(authCreatedContext);
  const queryClient = useQueryClient();

  const postBody = useRef<HTMLTextAreaElement>(null);
  const imageFile = useRef<HTMLInputElement>(null);
  // starts with the existing image of the post (if any)
  const [imageURL, setImageURL] = useState(post?.image ?? "");

  function revokeIfBlob(url: string) {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function imagePreview(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    revokeIfBlob(imageURL);
    setImageURL(file ? URL.createObjectURL(file) : (post?.image ?? ""));
  }

  function removeImage() {
    revokeIfBlob(imageURL);
    setImageURL("");
    if (imageFile.current) imageFile.current.value = "";
  }

  function handleClose() {
    revokeIfBlob(imageURL);
    onClose();
  }

  function handleUpdate() {
    const formData = new FormData();
    if (postBody.current) formData.append("body", postBody.current.value);
    const file = imageFile.current?.files?.[0];
    if (file) formData.append("image", file);

    return axios.put(
      `https://route-posts.routemisr.com/posts/${post?._id}`,
      formData,
      { headers: { token } },
    );
  }

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: handleUpdate,
    onSuccess: function () {
      toast.success("Frame edited successfully!");
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
      handleClose();
    },
    onError: function () {
      toast.danger("Could not edit frame");
    },
  });

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={!!post}
        onOpenChange={(open) => !open && handleClose()}
        className="z-50 bg-black/60"
      >
        <Modal.Container placement="center" className="p-4">
          <Modal.Dialog
            aria-label="Edit Frame"
            className="w-full rounded-none border border-(--Border) bg-(--page) p-5 shadow-lg sm:max-w-2xl dark:border-(--dark-border) dark:bg-(--dark-page)"
          >
            <Modal.Header className={`font-display text-lg italic ${text}`}>
              Edit Frame
            </Modal.Header>

            <Modal.Body className="mt-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={post?.user?.name}
                  photo={post?.user?.photo}
                  size="size-10"
                />
                <div>
                  <p className={`font-display font-semibold italic ${text}`}>
                    {post?.user?.name}
                  </p>
                  <p className={`font-typewriter text-xs ${muted}`}>Public</p>
                </div>
              </div>

              <textarea
                id="edit-composer"
                rows={5}
                ref={postBody}
                defaultValue={post?.body ?? ""}
                placeholder="What's the moment?"
                className={`font-typewriter mt-4 w-full resize-none border border-(--Border) bg-transparent p-3 text-sm outline-none transition-colors placeholder:text-(--Muted) focus:border-(--Accent) dark:border-(--dark-border) dark:placeholder:text-(--dark-muted) dark:focus:border-(--dark-accent) ${text}`}
              />

              {imageURL && (
                <div className="my-3 flex justify-end">
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={removeImage}
                    className="relative top-0 cursor-pointer border-2 border-(--Accent) bg-(--page) p-3 text-lg text-(--Accent) transition-all duration-200 hover:border-(--page) hover:bg-(--Accent) hover:text-(--page)"
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              )}

              {imageURL && (
                <img
                  src={imageURL}
                  alt="Selected photo preview"
                  className="max-h-150 w-full object-cover"
                />
              )}
            </Modal.Body>

            <Modal.Footer className="mt-4 flex items-center justify-between gap-3 border-t border-(--Border) pt-3 dark:border-(--dark-border)">
              <label
                htmlFor="editImage"
                className={`font-typewriter flex min-w-0 cursor-pointer items-center gap-2 text-sm transition-colors hover:text-(--Text) dark:hover:text-(--dark-text) ${muted}`}
              >
                <IoImageOutline className="shrink-0 text-base" />
                <span>Photo/video</span>
              </label>
              <input
                id="editImage"
                ref={imageFile}
                type="file"
                accept="image/*"
                onChange={imagePreview}
                className="sr-only"
              />

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`font-typewriter cursor-pointer border border-(--Border) px-4 py-2 text-sm transition-colors dark:border-(--dark-border) ${text}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => updateMutation()}
                  className={`font-typewriter cursor-pointer px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accentBtn}`}
                >
                  {isPending ? "Editing Frame..." : "Edit Frame"}
                </button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function PostCard({
  post,
  onEdit,
}: {
  post: FeedPost;
  onEdit: (post: PostType) => void;
}) {
  const { userID, token } = useContext(authCreatedContext);
  const queryClient = useQueryClient();

  
const liked = userID ? (post.likes?.includes(userID) ?? false) : false;
  function deletePost() {
    return axios.delete(`https://route-posts.routemisr.com/posts/${post._id}`, {
      headers: { token },
    });
  }

  function likePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${post._id}/like`,
      {},
      { headers: { token } },
    );
  }

  // Flips this post's like in the cached feed (used for the optimistic update and the rollback).
  function setLikedInCache(nextLiked: boolean) {
    if (!userID) return;
    const uid: string = userID; // plain string, so TypeScript is happy inside the callbacks

    queryClient.setQueryData<FeedCache>(["allposts"], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            posts: old.data.data.posts.map((p) => {
              if (p._id !== post._id) return p;
              const currentLikes = p.likes ?? [];
              const alreadyLiked = currentLikes.includes(uid);
              if (alreadyLiked === nextLiked) return p;
              return {
                ...p,
                likes: nextLiked
                  ? [...currentLikes, uid]
                  : currentLikes.filter((id) => id !== uid),
                likesCount: Math.max(0, p.likesCount + (nextLiked ? 1 : -1)),
              };
            }),
          },
        },
      };
    });
  }

  const { mutate: likeMutation } = useMutation({
    mutationFn: likePost,
    onMutate: async () => {
      // stop any in-flight refetch from overwriting the optimistic value
      await queryClient.cancelQueries({ queryKey: ["allposts"] });
      const wasLiked = liked;
      setLikedInCache(!wasLiked);
      return { wasLiked };
    },
    onError: (_err, _vars, context) => {
      // roll back to what it was before the click
      setLikedInCache(context?.wasLiked ?? liked);
      toast.danger("Could not update like");
    },
    onSettled: () => {
      // sync with the server
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
    },
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deletePost,
    onSuccess: function () {
      toast.success("Frame deleted");
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
    },
    onError: function () {
      toast.danger("Could not delete frame");
    },
  });

  const isOwner = userID === post.user?._id;

  function handleMenuAction(key: React.Key) {
    if (key === "edit-post") onEdit(post);
    if (key === "delete-post") deleteMutation();
  }

  const menuItemBase =
    "group flex items-center justify-start gap-2 rounded-none transition-all duration-200";

  return (
    <TitleCard>
      <article>
        <header className="flex items-center gap-3">
          <UserAvatar name={post.user?.name} photo={post.user?.photo} />
          <div className="min-w-0 flex-1">
            <p className={`font-display truncate font-semibold italic ${text}`}>
              {post.user?.name}
            </p>
            <p className={`font-typewriter truncate text-xs ${muted}`}>
              {new Date(post.createdAt).toLocaleString("en-us", {
                day: "numeric",
                year: "numeric",
                month: "short",
              })}
            </p>
          </div>

          <Dropdown>
            <Button
              aria-label="Menu"
              className="rounded-none bg-(--Card) px-4 py-5 text-(--Accent) transition-all duration-200 hover:border-(--page) hover:bg-(--Accent) hover:text-(--page) dark:bg-(--dark-page) dark:text-(--dark-accent)"
            >
              <GiHamburgerMenu />
            </Button>
            <Dropdown.Popover className="rounded-none border border-(--Accent) bg-(--page) dark:bg-(--dark-page)">
              <Dropdown.Menu onAction={handleMenuAction}>
                {isOwner ? (
                  <>
                    <Dropdown.Item
                      id="edit-post"
                      textValue="Edit post"
                      className={`${menuItemBase} ${text} hover:bg-(--Accent) hover:text-(--page) dark:hover:bg-(--dark-accent)`}
                    >
                      <AiOutlineEdit />
                      Edit post
                    </Dropdown.Item>
                    <Dropdown.Item
                      id="delete-post"
                      textValue="Delete frame"
                      variant="danger"
                      className={`${menuItemBase} text-(--Error) hover:bg-(--Error) hover:text-(--page)`}
                    >
                      <RiDeleteBinLine />
                      Delete Frame
                    </Dropdown.Item>
                  </>
                ) : (
                  <Dropdown.Item
                    id="save-post"
                    textValue="Save frame"
                    className={`${menuItemBase} ${text} hover:bg-(--Accent) hover:text-(--page) dark:hover:bg-(--dark-accent)`}
                  >
                    <IoBookmarkOutline />
                    Save Frame
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </header>

        <Link to={`/postInfo/${post._id}`}>
          <p
            className={`font-typewriter mt-3 text-sm leading-relaxed wrap-break-word ${text}`}
          >
            {post.body}
          </p>

          {post.image && (
            <img
              src={post.image}
              alt={`Photo by ${post.user?.name}`}
              loading="lazy"
              className="mt-3 aspect-4/3 w-full max-w-full object-cover sm:aspect-video"
            />
          )}
        </Link>

        <footer
          className={`font-typewriter mt-3 flex items-center gap-5 text-sm ${muted}`}
        >
          <button
            type="button"
            onClick={() => likeMutation()}
            aria-pressed={liked}
            aria-label={liked ? "Unlike" : "Like"}
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-(--Accent-hover) dark:hover:text-(--dark-accent-hover)"
          >
            {liked ? (
              <IoHeart className="text-base text-(--Error)" />
            ) : (
              <IoHeartOutline className="text-base" />
            )}
            {post.likesCount}
          </button>
          <Link
            to={`/postInfo/${post._id}`}
            className="flex items-center gap-1.5 transition-colors hover:text-(--Text) dark:hover:text-(--dark-text)"
          >
            <IoChatbubbleOutline className="text-base" />
            {post.commentsCount}
          </Link>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-(--Text) dark:hover:text-(--dark-text)"
          >
            <IoShareSocialOutline className="text-base" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </footer>

        {post.topComment && (
          <>
            <hr className="mt-5 border-(--Border) dark:border-(--dark-border)" />

            <div className="mt-5 flex flex-col items-start justify-center gap-2 bg-(--Card) dark:bg-(--Dark-card)">
              <div className="flex items-center justify-center gap-2 p-3">
                <UserAvatar
                  name={post.topComment.commentCreator?.name}
                  photo={post.topComment.commentCreator?.photo}
                  size="size-8"
                />
                <div className="flex flex-col items-start justify-center gap-1">
                  <p className={text}>{post.topComment.commentCreator?.name}</p>
                  <p className={`text-sm ${muted}`}>
                    {new Date(post.topComment.createdAt).toLocaleString(
                      "en-us",
                      { day: "numeric", year: "numeric", month: "short" },
                    )}
                  </p>
                </div>
              </div>

              <div className={`ps-3 ${text}`}>{post.topComment.content}</div>

              {post.commentsCount > 1 && (
                <Link
                  to={`/postInfo/${post._id}`}
                  className="ps-3 text-xs text-gray-400 transition-all duration-150 hover:text-(--Accent) dark:hover:text-(--dark-accent)"
                >
                  show {post.commentsCount - 1}{" "}
                  {post.commentsCount - 1 === 1 ? "more reply" : "more replies"}
                </Link>
              )}
            </div>
          </>
        )}
      </article>
    </TitleCard>
  );
}

/* ------------------------------------------------------------------ */
/* Home page                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  const { token } = useContext(authCreatedContext);
  const { open } = useComposer(); // the composer modal lives in ComposerProvider
  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  async function getPosts() {
    return axios.get("https://route-posts.routemisr.com/posts", {
      headers: { token },
    });
  }

  const { data, isLoading, isError } = useQuery({
    queryFn: getPosts,
    queryKey: ["allposts"],
    enabled: !!token,
    refetchInterval: 300000,
    refetchOnWindowFocus: false,
  });

  const posts: FeedPost[] = data?.data?.data?.posts ?? [];

  return (
    <div className="mx-auto grid w-full max-w-7xl px-4 pt-5 pb-28 md:px-6 md:pb-28 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-4 lg:px-20 lg:pb-10">
      <aside className="hidden w-60 lg:block">
        <div className="sticky top-18">
          <SideNav onOpenComposer={open} />
        </div>
      </aside>

      <section
        aria-label="Feed"
        className="grid w-full min-w-0 grid-cols-1 content-start gap-5"
      >
        {isLoading ? (
          <TitleCard>
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-(--Border) dark:bg-(--dark-border)" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-(--Border) dark:bg-(--dark-border)" />
                  <div className="h-3 w-20 rounded bg-(--Border)/60 dark:bg-(--dark-border)/60" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-(--Border) dark:bg-(--dark-border)" />
                <div className="h-3.5 w-1/2 rounded bg-(--Border)/60 dark:bg-(--dark-border)/60" />
              </div>

              <div className="mt-3 aspect-4/3 w-full rounded bg-(--Border) dark:bg-(--dark-border) sm:aspect-video" />

              <div className="mt-4 flex items-center gap-6">
                <div className="h-4 w-12 rounded bg-(--Border) dark:bg-(--dark-border)" />
                <div className="h-4 w-12 rounded bg-(--Border) dark:bg-(--dark-border)" />
                <div className="h-4 w-12 rounded bg-(--Border) dark:bg-(--dark-border)" />
                <div className="ml-auto h-4 w-5 rounded bg-(--Border) dark:bg-(--dark-border)" />
              </div>
            </div>
          </TitleCard>
        ) : isError ? (
          <p className="py-12 text-center text-(--Error) dark:text-(--dark-error)">
            Could not load the feed.
          </p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onEdit={setEditingPost} />
          ))
        )}
      </section>

      <nav className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t border-(--Border) bg-(--page) p-3 lg:hidden dark:border-(--dark-border) dark:bg-(--dark-page)">
        {navItems.slice(0, 2).map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `p-2 text-2xl transition-colors ${
                isActive ? "text-(--Accent) dark:text-(--dark-accent)" : muted
              }`
            }
          >
            <Icon />
          </NavLink>
        ))}

        <button
          type="button"
          onClick={open}
          className={`flex h-12 w-12 cursor-pointer items-center justify-center text-2xl shadow-md transition-transform active:scale-95 ${accentBtn}`}
          aria-label="Create Frame"
        >
          <IoAddOutline />
        </button>

        {navItems.slice(2, 4).map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `p-2 text-2xl transition-colors ${
                isActive ? "text-(--Accent) dark:text-(--dark-accent)" : muted
              }`
            }
          >
            <Icon />
          </NavLink>
        ))}
      </nav>

      {/* One edit modal for all posts. `key` resets its state per post. */}
      <EditPostModal
        key={editingPost?._id ?? "none"}
        post={editingPost}
        onClose={() => setEditingPost(null)}
      />
    </div>
  );
}
