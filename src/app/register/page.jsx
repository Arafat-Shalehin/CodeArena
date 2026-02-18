"use client";

import { useForm } from "react-hook-form";
import { Check, X } from "lucide-react";
import Link from "next/link";
import RegisterAside from "@/components/layout/RegisterAside";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password", "");

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allRulesPass = Object.values(rules).every(Boolean);

  const onSubmit = (data) => {
    if (!allRulesPass) {
      alert("Please fulfill all password requirements!");
      return;
    }
    console.log("REGISTER DATA 👉", data);
  };

  const RuleItem = ({ label, valid }) => (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check className="text-green-500 w-4 h-4" />
      ) : (
        <X className="text-gray-400 w-4 h-4" />
      )}
      <span className={valid ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );

  const inputStyle =
    "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      {/*Registation page container Container */}

      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl flex flex-col md:flex-row items-stretch overflow-hidden border border-gray-100">
        {/* Left Side: Aside  */}

        <div className="flex-1 w-full  flex flex-col justify-center">
          <RegisterAside />
        </div>
        {/* Right Side :form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Create your account
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Join CodeArena and start competing
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className={inputStyle}
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className={inputStyle}
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  className={inputStyle}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className={inputStyle}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <div className="bg-gray-50 p-3 rounded-md space-y-1 mt-2 border border-gray-100">
                  <RuleItem
                    label="At least 8 characters"
                    valid={rules.length}
                  />
                  <RuleItem
                    label="One uppercase letter"
                    valid={rules.uppercase}
                  />
                  <RuleItem label="One number" valid={rules.number} />
                  <RuleItem
                    label="One special character"
                    valid={rules.special}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={inputStyle}
                  {...register("confirmPassword", {
                    required: "Please confirm password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Agree Checkbox */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded text-green-600"
                    {...register("agree", {
                      required: "You must agree to the terms",
                    })}
                  />
                  I agree to the Terms & Conditions
                </label>
                {errors.agree && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.agree.message}
                  </p>
                )}
              </div>

              {/* Submit Button with Your Colors (Implicit Gradient) */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition font-semibold shadow-sm"
              >
                Create Account
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400 uppercase tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium text-gray-600">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-4 h-4"
                  alt="G"
                />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium text-gray-600">
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  className="w-4 h-4"
                  alt="Git"
                />
                GitHub
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
