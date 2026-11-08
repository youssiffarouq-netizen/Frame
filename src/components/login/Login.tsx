import { useContext, useState } from "react";
import { FaKey, FaUser } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { authCreatedContext } from "../../../context/AuthContext";
const inputClass =
  "w-full border-b-2 border-[var(--Border)] bg-(--Card) pl-10 pr-4 py-4 outline-none focus:border-[var(--Accent)] transition-all duration-300 placeholder:text-[var(--Muted)] text-[var(--Accent)] caret-[var(--Accent)] dark:bg-[var(--Dark-card)] dark:border-[var(--dark-border)] dark:focus:border-[var(--dark-accent)] dark:placeholder:text-[var(--dark-muted)] dark:text-[var(--dark-text)] dark:caret-[var(--dark-accent)]";

const iconClass =
  "absolute left-3 top-1/2 -translate-y-1/2 text-(--Muted) text-base";

const eyeClass =
  "absolute right-3 top-1/2 -translate-y-1/2 text-(--Muted) hover:text-(--Accent-hover) transition-colors";

const userInfoSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    ),
});

type loginInfo = z.infer<typeof userInfoSchema>;

export default function Login() {
  const {  setTokenValue } = useContext(authCreatedContext);

  const routeToHome = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  function showPassword() {
    setShowPass(!showPass);
  }

  const { handleSubmit, register } = useForm<loginInfo>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(userInfoSchema),
  });

  async function handleLogin(formVals: loginInfo) {
    setLoading(true);
    console.log(formVals);

    try {
      const { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signin",
        formVals,
      );
      toast.success(data.message);
      setTokenValue(data.data.token);

      routeToHome("/home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.danger(err.response?.data.message);
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 justify-center">
      <h2 className="font-extrabold text-(--Accent) dark:text-(--dark-accent)">
        Log in to Frame
      </h2>
      <p className="text-(--Muted) dark:text-(--dark-muted)">
        Log in and continue your social journey.
      </p>
      <form
        className="flex flex-col gap-3"
        action=""
        onSubmit={handleSubmit(handleLogin)}
      >
        <div className="relative">
          <FaUser className={iconClass} />
          <input
            className={inputClass}
            type="text"
            placeholder="Email or username"
            {...register("email")}
          />
        </div>
        <div className="relative">
          <FaKey className={iconClass} />
          <input
            className={inputClass}
            type={showPass ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
          />
          <button type="button" onClick={showPassword} className={eyeClass}>
            {showPass ? <IoEye /> : <IoEyeOff />}
          </button>
        </div>

        <button
          className="flex h-14 w-full cursor-pointer items-center justify-center bg-(--Accent) px-4 font-bold text-white transition-all duration-100 hover:bg-(--Accent-hover) disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--dark-accent) dark:text-(--Accent) dark:hover:bg-(--dark-accent-hover)"
          disabled={loading ? true : false}
        >
          {loading ? (
            <TailSpin
              visible={true}
              height="24"
              width="24"
              color="var(--On-accent)"
              ariaLabel="tail-spin-loading"
              radius="1"
            />
          ) : (
            "Sign In"
          )}
        </button>

        <a
          href=""
          className="text-(--Accent) no-underline hover:underline m-auto dark:text-(--dark-accent)"
        >
          Forgot Password?
        </a>
      </form>
    </div>
  );
}
