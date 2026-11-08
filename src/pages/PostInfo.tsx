import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authCreatedContext } from "../../context/AuthContext";
import { FaArrowLeft, FaCommentDots, FaHeart, FaRegHeart } from "react-icons/fa";
import { CiBookmark, CiShare2 } from "react-icons/ci";

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-(--Border) dark:bg-(--dark-border) ${className}`}
    />
  );
}

function Avatar({
  name,
  photo,
  className = "size-9 text-lg",
}: {
  name?: string;
  photo?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`${className} flex shrink-0 items-center justify-center overflow-hidden bg-(--Accent) italic text-(--On-accent) dark:bg-(--dark-accent) dark:text-(--dark-on-accent)`}
    >
      {photo ? (
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        (name?.[0]?.toUpperCase() ?? "?")
      )}
    </div>
  );
}

const actionBtn =
  "flex items-center gap-1.5 min-h-9 px-2 text-base cursor-pointer text-(--Text) hover:text-(--Accent-hover) dark:text-(--dark-text) dark:hover:text-(--dark-accent-hover)";

export default function PostInfo() {
  const { id } = useParams();
  const { token } = useContext(authCreatedContext);
  const queryClient = useQueryClient();
  const navigateBack = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["singlePost", id],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
        headers: { token },
      }),
    enabled: !!token && !!id,
  });

  const { data: commentsData } = useQuery({
    queryKey: ["comments", id],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/posts/${id}/comments`, {
        headers: { token },
      }),
    enabled: !!token && !!id,
  });

  const [comment, setComment] = useState("");

  function postComment() {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${id}/comments`,
      { content: comment.trim() },
      { headers: { token } },
    );
  }

  const { mutate, isPending } = useMutation({
    mutationFn: postComment,
    onSuccess: function () {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
    },
  });

  
  const post = data?.data?.post ?? data?.data?.data?.post;
  const comments = commentsData?.data?.data?.comments ?? [];

  function goBack() {
    navigateBack(-1);
  }

  if (isLoading)
    return (
      <div
        role="status"
        aria-label="Loading post"
        className="mx-auto flex max-w-220 flex-col gap-3 px-4 pt-4 pb-12 text-[15px] tracking-wide"
      >
        <div className="flex min-h-11 items-center self-start">
          <Bone className="h-4 w-28" />
        </div>

        <article className="border border-(--Border) bg-(--Card) p-1.5 shadow-[0_6px_24px_var(--myShadow)] dark:border-(--dark-border) dark:bg-(--Dark-card) dark:shadow-[0_6px_24px_var(--mydark-shadow)]">
          <div className="flex flex-col gap-4 border border-(--Border) p-4 sm:p-5 dark:border-(--dark-border)">
            <div className="flex items-center gap-3">
              <Bone className="size-11 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Bone className="h-5 w-32" />
                <Bone className="h-4 w-24" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Bone className="h-5 w-full" />
              <Bone className="h-5 w-2/3" />
            </div>

            <Bone className="aspect-16/10 max-h-150 w-full" />

            <div
              aria-hidden="true"
              className="flex min-h-9 items-center gap-2 text-(--Border) dark:text-(--dark-border)"
            >
              <span className="flex items-center gap-1.5 px-2">
                <FaRegHeart />
                <Bone className="h-4 w-3" />
              </span>
              <span className="flex items-center gap-1.5 px-2">
                <FaCommentDots />
                <Bone className="h-4 w-3" />
              </span>
              <span className="flex items-center gap-1.5 px-2">
                <CiShare2 />
                <Bone className="h-4 w-10" />
              </span>
              <span className="ml-auto px-2">
                <CiBookmark />
              </span>
            </div>

            <hr className="border-t border-(--Border) dark:border-(--dark-border)" />

            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <Bone className="h-6 w-28" />
                <Bone className="h-4 w-4" />
              </div>

              <div className="flex gap-3">
                <Bone className="min-h-10 flex-1" />
                <Bone className="min-h-10 w-16" />
              </div>

              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <Bone className="size-9 shrink-0" />
                  <div className="flex flex-1 flex-col gap-1">
                    <Bone className="h-5 w-32" />
                    <Bone className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );

  if (isError || !post)
    return (
      <p className="py-12 text-center text-(--Error) dark:text-(--dark-error)">
        Could not load this post.
      </p>
    );

  return (
    <div className="mx-auto flex max-w-220 flex-col gap-3 px-4 pt-4 pb-12 text-[15px] tracking-wide text-(--Text) dark:text-(--dark-text)">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start text-(--Muted) hover:text-(--Accent) dark:text-(--dark-muted) dark:hover:text-(--dark-accent)"
      >
        <FaArrowLeft />
        Back
      </button>

      <article className="border border-(--Border) bg-(--Card) p-1.5 shadow-[0_6px_24px_var(--myShadow)] dark:border-(--dark-border) dark:bg-(--Dark-card) dark:shadow-[0_6px_24px_var(--mydark-shadow)]">
        <div className="flex flex-col gap-4 border border-(--Border) p-4 sm:p-5 dark:border-(--dark-border)">
          <header className="flex items-center gap-3">
            <Avatar
              name={post.user?.name}
              photo={post.user?.photo}
              className="size-11 text-xl"
            />
            <div className="min-w-0">
              <div className="text-lg leading-tight font-medium italic">
                {post.user?.name}
              </div>
              <div className="text-sm text-(--Muted) dark:text-(--dark-muted)">
                {formatDate(post.createdAt)}
              </div>
            </div>
          </header>

          {post.body && <p className="text-base">{post.body}</p>}
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="block max-h-150 w-full object-cover"
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Like" className={actionBtn}>
              <FaHeart />
              {post.likes?.length ?? post.likesCount ?? 0}
            </button>
            <button type="button" aria-label="Comments" className={actionBtn}>
              <FaCommentDots />
              {comments.length}
            </button>
            <button type="button" className={actionBtn}>
              <CiShare2 />
              Share
            </button>
            <button
              type="button"
              aria-label="Save post"
              className={`${actionBtn} ml-auto`}
            >
              <CiBookmark />
            </button>
          </div>

          <hr className="border-t border-(--Border) dark:border-(--dark-border)" />

          <section
            aria-labelledby="comments-title"
            className="flex flex-col gap-4"
          >
            <div className="flex items-baseline gap-2">
              <h2 id="comments-title" className="text-xl font-bold">
                Comments
              </h2>
              <span className="text-(--Muted) dark:text-(--dark-muted)">
                {comments.length}
              </span>
            </div>

            <form
              className="flex flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim() && !isPending) mutate();
              }}
            >
              <label htmlFor="new-comment" className="sr-only">
                Add a comment
              </label>
              <input
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                id="new-comment"
                type="text"
                placeholder="Add a comment..."
                className="min-h-10 min-w-0 flex-1 basis-56 border border-(--Border) bg-(--page) px-3 text-sm text-(--Text) placeholder:text-(--Muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--Accent) dark:border-(--dark-border) dark:bg-(--dark-page) dark:text-(--dark-text) dark:placeholder:text-(--dark-muted) dark:focus-visible:outline-(--dark-accent)"
              />
              <button
                disabled={isPending || !comment.trim()}
                type="submit"
                className="min-h-10 cursor-pointer bg-(--Accent) px-5 text-white transition-colors hover:bg-(--Accent-hover) disabled:cursor-not-allowed disabled:opacity-50 dark:bg-(--dark-accent) dark:text-(--dark-on-accent) dark:hover:bg-(--dark-accent-hover)"
              >
                {isPending ? "Posting..." : "Post"}
              </button>
            </form>

            {comments.map((c: any) => (
              <div key={c._id} className="flex gap-3">
                <Avatar
                  name={c.commentCreator?.name}
                  photo={c.commentCreator?.photo}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-base font-medium">
                      {c.commentCreator?.name}
                    </span>
                    <span className="text-xs text-(--Muted) dark:text-(--dark-muted)">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm wrap-break-word">{c.content}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </article>
    </div>
  );
}
