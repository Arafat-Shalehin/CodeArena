"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import LoginAside from "@/components/layout/LoginAside";

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const onSubmit = (data) => {
    console.log("LOGIN DATA 👉", data);
  };

  const inputStyle =
    "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      {/* Main Container: overflow-hidden corners এর জন্য */}
      <div className=" w-full max-w-5xl rounded-xl shadow-xl flex flex-col md:flex-row items-stretch overflow-hidden border border-gray-100">
        {/* Left Side: LoginAside (Equal height/width) */}
        <div className="bg-gradient-to-br  from-(--color-accent) via-(--color-accent-hover)_30% to-(--color-accent-text) flex-1  flex flex-col justify-center">
          <LoginAside />
        </div>

        {/* Right Side: Form Section (Equal height/width) */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-500">Login to continue to CodeArena</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email or Username input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  className={inputStyle}
                  {...register("identifier", {
                    required: "Email or Username is required",
                    minLength: { value: 3, message: "Too short" },
                  })}
                />
                {errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-green-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputStyle}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition-colors font-semibold shadow-sm"
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400 uppercase tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-all text-sm font-medium text-gray-600">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-4 h-4"
                  alt="google"
                />
                Google
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-all text-sm font-medium text-gray-600">
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  className="w-4 h-4"
                  alt="github"
                />
                GitHub
              </button>
            </div>

            {/* Navigate Signup */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="text-green-600 font-bold hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
