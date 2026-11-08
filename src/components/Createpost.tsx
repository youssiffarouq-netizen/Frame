import {
  createContext,
  useContext,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Modal, toast } from "@heroui/react";
import { IoImageOutline } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authCreatedContext } from "../../context/AuthContext";
import { RiDeleteBinLine } from "react-icons/ri";

const text = "text-(--Text) dark:text-(--dark-text)";
const muted = "text-(--Muted) dark:text-(--dark-muted)";
const line = "border-(--Border) dark:border-(--dark-border)";
const accentBtn =
  "bg-(--Accent) text-(--On-accent) hover:bg-(--Accent-hover) dark:bg-(--dark-accent) dark:text-(--dark-on-accent) dark:hover:bg-(--dark-accent-hover)";

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface PostType {
  _id: string;
  body: string;
  image: string;
  privacy: string;
  user: User;
  sharedPost: boolean;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
  topComment?: {
    _id: string;
    content: string;
    commentCreator: User;
    post: string;
    parentComment: boolean;
    likes: string[];
    createdAt: string;
  };
}

export function UserAvatar({
  name,
  photo,
  size = "size-12",
}: {
  name?: string;
  photo?: string;
  size?: string;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={`${size} shrink-0 rounded-none object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`font-display grid ${size} shrink-0 place-items-center rounded-none bg-(--Border) font-bold dark:bg-(--dark-border) ${text}`}
    >
      {(name ?? "").charAt(0)}
    </span>
  );
}

export default function ComposerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const imageFile = useRef<HTMLInputElement>(null);
  const postBody = useRef<HTMLTextAreaElement>(null);
  const [imageURL, setImageURL] = useState("");

  const { token, userID, user } = useContext(authCreatedContext);
  const queryClient = useQueryClient();

  // Same query key as Home, so React Query reuses the cached feed.
  const { data: feed } = useQuery({
    queryKey: ["allposts"],
    queryFn: () =>
      axios.get("https://route-posts.routemisr.com/posts", {
        headers: { token },
      }),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const posts: PostType[] = feed?.data?.data?.posts ?? [];

  // 1) try to find the user in the feed, 2) fall back to the user saved at login
  const currentUser: User | null =
    posts.find((p) => p.user?._id === userID)?.user ?? user ?? null;

  function clearImage() {
    if (imageURL) URL.revokeObjectURL(imageURL);
    setImageURL("");
    if (imageFile.current) imageFile.current.value = "";
  }

  function resetAndClose() {
    clearImage();
    if (postBody.current) postBody.current.value = "";
    onClose();
  }

  function imagePreview(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (imageURL) URL.revokeObjectURL(imageURL);
    setImageURL(file ? URL.createObjectURL(file) : "");
  }

  function sendPost() {
    const postData = new FormData();

    if (postBody.current?.value) {
      postData.append("body", postBody.current.value);
    }
    const file = imageFile.current?.files?.[0];
    if (file) {
      postData.append("image", file);
    }

    return axios.post("https://route-posts.routemisr.com/posts", postData, {
      headers: { token },
    });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: sendPost,
    onSuccess: function () {
      toast.success("Frame added");
      queryClient.invalidateQueries({ queryKey: ["allposts"] });
      resetAndClose();
    },
    onError: function () {
      toast.danger("Could not add frame");
    },
  });

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && resetAndClose()}
        className="z-50 bg-black/60"
      >
        <Modal.Container placement="center" className="p-4">
          <Modal.Dialog
            aria-label="Create Frame"
            className="w-full rounded-none border border-(--Border) bg-(--page) p-5 shadow-lg sm:max-w-2xl dark:border-(--dark-border) dark:bg-(--dark-page)"
          >
            <Modal.Header className={`font-display text-lg italic ${text}`}>
              Create Frame
            </Modal.Header>

            <Modal.Body className="mt-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={currentUser?.name ?? ""}
                  photo={currentUser?.photo}
                  size="size-10"
                />
                <div>
                  <p className={`font-display font-semibold italic ${text}`}>
                    {currentUser?.name}
                  </p>
                  <p className={`font-typewriter text-xs ${muted}`}>Public</p>
                </div>
              </div>

              <textarea
                id="composer"
                rows={5}
                ref={postBody}
                placeholder={
                  currentUser?.name
                    ? `What's the moment, ${currentUser.name}?`
                    : "What's the moment?"
                }
                className={`font-typewriter mt-4 w-full resize-none border bg-transparent p-3 text-sm outline-none transition-colors placeholder:text-(--Muted) focus:border-(--Accent) dark:placeholder:text-(--dark-muted) dark:focus:border-(--dark-accent) ${line} ${text}`}
              />

              {imageURL && (
                <div className="my-3 flex justify-end">
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={clearImage}
                    className="relative top-0 cursor-pointer border-2 border-(--Accent) bg-(--page) p-3 text-lg text-(--Accent) transition-all duration-200 hover:border-(--page) hover:bg-(--Accent) hover:text-(--page)"
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              )}

              {imageURL && (
                <div>
                  <img
                    src={imageURL}
                    alt="Selected photo preview"
                    className="max-h-150 w-full object-cover"
                  />
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="mt-4 flex items-center justify-between gap-3 border-t border-(--Border) pt-3 dark:border-(--dark-border)">
              <label
                htmlFor="addImage"
                className={`font-typewriter flex min-w-0 cursor-pointer items-center gap-2 text-sm transition-colors hover:text-(--Text) dark:hover:text-(--dark-text) ${muted}`}
              >
                <IoImageOutline className="shrink-0 text-base" />
                <span>Photo/video</span>
              </label>
              <input
                id="addImage"
                ref={imageFile}
                type="file"
                accept="image/*"
                onChange={imagePreview}
                className="sr-only"
              />

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className={`font-typewriter cursor-pointer border px-4 py-2 text-sm transition-colors ${line} ${text}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => mutate()}
                  className={`font-typewriter cursor-pointer px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accentBtn}`}
                >
                  {isPending ? "Adding Frame..." : "Add Frame"}
                </button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

const ComposerContext = createContext<{ open: () => void }>({
  open: () => {},
});

export function useComposer() {
  return useContext(ComposerContext);
}

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ComposerContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <ComposerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ComposerContext.Provider>
  );
}
