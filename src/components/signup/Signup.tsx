import {  useState } from "react";
import styles from "./signup.module.css";
import { Tabs } from "@heroui/react";
import {  FaKey, FaUser } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { BiMaleFemale } from "react-icons/bi";
import { SlCalender } from "react-icons/sl";
import { GiConfirmed } from "react-icons/gi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "@heroui/react";
import Login from "../login/Login";
import { TailSpin } from "react-loader-spinner";

const userInfoSchema = z
  .object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name must be at most 50 characters long"),
    username: z.string().min(2).max(100).optional(),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email format"),
    dateOfBirth: z.date().refine(function (date) {
      const now = new Date();
      const userAge = now.getFullYear() - date.getFullYear();
      return userAge >= 18;
    }),
    gender: z.enum(["male", "female"], "Gender must be either male or female"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      ),
    rePassword: z
      .string()
      .nonempty("Please confirm your password")
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      ),
  })
  .refine(
    function (values) {
      return values.password === values.rePassword;
    },
    {
      path: ["rePassword"],
      message: "Password confirmation must match the password",
    },
  );

type userInfo = z.infer<typeof userInfoSchema>;

const inputClass =
  "w-full border-b-2 border-[var(--Border)] bg-(--Card) pl-10 pr-4 py-4 outline-none focus:border-[var(--Accent)] transition-all duration-300 placeholder:text-[var(--Muted)] text-[var(--Accent)] caret-[var(--Accent)] dark:bg-[var(--Dark-card)] dark:border-[var(--dark-border)] dark:focus:border-[var(--dark-accent)] dark:placeholder:text-[var(--dark-muted)] dark:text-[var(--dark-text)] dark:caret-[var(--dark-accent)]";

const iconClass =
  "absolute left-3 top-1/2 -translate-y-1/2 text-(--Muted) text-base";

const eyeClass =
  "absolute right-3 top-1/2 -translate-y-1/2 text-(--Muted) hover:text-(--Accent-hover) transition-colors";

const errorClass = "text-(--Error) text-sm h-5 dark:text-(--dark-error)";

export default function Signup() {

  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  function showPassword() {
    setShowPass(!showPass);
  }

  const [showRePass, setShowRePass] = useState(false);
  function showRePassword() {
    setShowRePass(!showRePass);
  }

  const { handleSubmit, register, formState } = useForm<userInfo>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: new Date(),
      gender: "male" as "male" | "female",
      password: "",
      rePassword: "",
    },
    resolver: zodResolver(userInfoSchema),
  });

  async function handleSignUp(formVals: userInfo) {
    setLoading(true);
    console.log(formVals);

    try {
      const { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signup",
        formVals,
      );
      toast.success(data.message + " " + "You can now log in.");
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
    <>
 

      <div
        className={`flex flex-col ${styles.style} justify-center items-center min-h-screen py-10 bg-(--page) dark:bg-(--dark-page)`}
      >
        <div className="p-2 bg-(--Card) border border-(--Accent) xl:w-[35%] lg:w-[55%] md:w-[60%] sm:w-[90%] shadow-[0_0_100px_5px_var(--myShadow)] dark:bg-(--Dark-card) dark:border-(--dark-border) dark:shadow-[0_0_20px_5px_var(--mydark-shadow)]">
          <div className="w-full bg-(--Card) border border-(--Accent)  p-5 flex justify-center items-center dark:bg-(--Dark-card) dark:border-(--dark-border)">
            <Tabs className="w-full max-w-md" variant="secondary">
              <Tabs.ListContainer className="bg-transparent">
                <Tabs.List aria-label="Options" className="w-full gap-0">
                  <Tabs.Tab
                    id="login"
                    className="relative flex-1 h-12 flex items-center justify-center text-base font-medium text-(--Muted) data-selected:text-(--Text) transition-colors dark:text-(--dark-muted) dark:data-selected:text-(--dark-text)"
                  >
                    Login
                    <Tabs.Indicator className="bg-(--Accent) dark:bg-(--dark-accent)" />
                  </Tabs.Tab>
                  <Tabs.Tab
                    id="signup"
                    className="relative flex-1 h-12 flex items-center justify-center text-base font-medium text-(--Muted) data-selected:text-(--Text) transition-colors dark:text-(--dark-muted) dark:data-selected:text-(--dark-text)"
                  >
                    Sign up
                    <Tabs.Indicator className="bg-(--Accent) dark:bg-(--dark-accent)" />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel className="pt-4" id="login">
                <Login />
              </Tabs.Panel>
              <Tabs.Panel className="pt-4" id="signup">
                <div className="flex flex-col gap-3 justify-center">
                  <h2 className="font-extrabold text-(--Accent)">
                    Create your Frame account
                  </h2>
                  <p className="text-(--Muted) mb-3">
                    Sign up and start your social journey.
                  </p>
                  <form
                    onSubmit={handleSubmit(handleSignUp)}
                    className="flex flex-col gap-0"
                    action=""
                  >
                    <div>
                      <div className="relative">
                        <FaUser className={iconClass} />
                        <input
                          className={inputClass}
                          type="text"
                          placeholder="Fullname"
                          {...register("name")}
                        />
                      </div>
                      <p className={errorClass}>
                        {formState.errors?.name?.message}
                      </p>
                    </div>

                    <div>
                      <div className="relative">
                        <FaUser className={iconClass} />
                        <input
                          className={inputClass}
                          type="text"
                          placeholder="Username (optional)"
                          {...register("username")}
                        />
                      </div>
                      <p className="h-5"></p>
                    </div>

                    <div>
                      <div className="relative">
                        <MdOutlineAlternateEmail className={iconClass} />
                        <input
                          className={inputClass}
                          type="text"
                          placeholder="Email address"
                          {...register("email")}
                        />
                      </div>
                      <p className={errorClass}>
                        {formState.errors?.email?.message}
                      </p>
                    </div>

                    <div>
                      <div className="relative">
                        <BiMaleFemale
                          className={`${iconClass} pointer-events-none`}
                        />
                        <select
                          id="Gender"
                          className={inputClass}
                          {...register("gender")}
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <p className={errorClass}>
                        {formState.errors?.gender?.message}
                      </p>
                    </div>

                    <div>
                      <div className="relative">
                        <SlCalender className={iconClass} />
                        <input
                          className={inputClass}
                          type="date"
                          placeholder="Date of birth"
                          {...register("dateOfBirth", {
                            valueAsDate: true,
                          })}
                        />
                      </div>
                      <p className={errorClass}>
                        {formState.errors?.dateOfBirth?.message}
                      </p>
                    </div>
                    <div>
                      <div className="relative">
                        <FaKey className={iconClass} />
                        <input
                          className={inputClass}
                          type={showPass ? "text" : "password"}
                          placeholder="Password"
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={showPassword}
                          className={eyeClass}
                        >
                          {showPass ? <IoEye /> : <IoEyeOff />}
                        </button>
                      </div>
                      <p className={errorClass}>
                        {formState.errors?.password?.message}
                      </p>
                    </div>

                    <div>
                      <div className="relative">
                        <GiConfirmed className={iconClass} />
                        <input
                          className={inputClass}
                          type={showRePass ? "text" : "password"}
                          placeholder="Confirm password"
                          {...register("rePassword")}
                        />
                        <button
                          type="button"
                          onClick={showRePassword}
                          className={eyeClass}
                        >
                          {showRePass ? <IoEye /> : <IoEyeOff />}
                        </button>
                      </div>
                      <p className={errorClass}>
                        {formState.errors?.rePassword?.message}
                      </p>
                    </div>

                    <button
                      disabled={loading}
                      className="flex h-14 w-full cursor-pointer items-center justify-center bg-(--Accent) px-4 font-bold text-white transition-all duration-100 hover:bg-(--Accent-hover) disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--dark-accent) dark:text-(--Accent) dark:hover:bg-(--dark-accent-hover)"
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
                        "Sign Up"
                      )}
                    </button>
                  </form>
                </div>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
