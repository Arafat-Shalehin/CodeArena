"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Firebase — sync displayName on save
import { auth } from "@/lib/firebase/config";
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, AtSign, FileText, X, Loader2 } from "lucide-react";

// ── Validation Schema ──────────────────────────────────────────────────────────
const editProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name must be at most 50 characters"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    bio: z
        .string()
        .max(160, "Bio must be at most 160 characters")
        .optional()
        .or(z.literal("")),
});

// ── Avatar Seeds ────────────────────────────────────────────────────────────────
const PREDEFINED_AVATARS = [
    "adventurer", "mage", "knight", "rogue", "cleric",
    "paladin", "bard", "druid", "ranger", "monk",
    "sorcerer", "warlock", "barbarian", "fighter", "wizard",
];

/**
 * @component EditProfileModal
 * @description Modal for editing display name, username, bio, and avatar.
 * Uses react-hook-form + Zod. Saves to AuthContext (localStorage-backed)
 * and syncs displayName to Firebase Auth.
 *
 * @param {Object} props
 * @param {Object} props.user - Current user data to prepopulate the form.
 * @param {Function} props.onSave - Callback fired with updated data on save.
 * @param {Function} props.onClose - Callback to close without saving.
 * @returns {JSX.Element} The rendered modal.
 */
export default function EditProfileModal({ user, onSave, onClose }) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: user?.name || "",
            username: user?.username || "",
            bio: user?.bio || "",
        },
    });

    // Controlled avatar seed (not part of Zod schema — it's always valid)
    const avatarSeed = watch("avatarSeed") ?? (user?.avatarSeed || user?.username || PREDEFINED_AVATARS[0]);

    // Set initial avatarSeed into the form so we can watch it
    useEffect(() => {
        setValue("avatarSeed", user?.avatarSeed || user?.username || PREDEFINED_AVATARS[0]);
    }, [user, setValue]);

    // Escape key + scroll lock
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const bioValue = watch("bio") || "";

    const onSubmit = async (data) => {
        // Sync displayName to Firebase Auth so it survives page reloads
        if (auth.currentUser) {
            try {
                await firebaseUpdateProfile(auth.currentUser, { displayName: data.name });
            } catch (e) {
                console.error("Firebase profile sync failed:", e);
            }
        }
        onSave({ name: data.name, username: data.username, bio: data.bio || "", avatarSeed });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-page/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-subtle/50 shrink-0">
                    <h2 className="text-xl font-semibold text-text-primary">Edit Profile</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable form body + sticky footer all inside one <form> */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">

                        {/* Display Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium text-text-primary">
                                Display Name
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                                    <User size={16} />
                                </div>
                                <Input
                                    id="name"
                                    className="pl-10 h-11"
                                    placeholder="Your display name"
                                    disabled={isSubmitting}
                                    {...register("name")}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-error font-medium">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-sm font-medium text-text-primary">
                                Username
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                                    <AtSign size={16} />
                                </div>
                                <Input
                                    id="username"
                                    className="pl-10 h-11"
                                    placeholder="your_username"
                                    disabled={isSubmitting}
                                    {...register("username")}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-error font-medium">{errors.username.message}</p>
                            )}
                            <p className="text-xs text-text-muted">Used everywhere on the platform to identify you.</p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="bio" className="text-sm font-medium text-text-primary">
                                    <span className="flex items-center gap-1.5">
                                        <FileText size={14} className="text-text-muted" />
                                        Bio
                                    </span>
                                </Label>
                                <span className={`text-xs font-medium ${bioValue.length > 140 ? "text-warning" : "text-text-muted"}`}>
                                    {bioValue.length}/160
                                </span>
                            </div>
                            <textarea
                                id="bio"
                                rows={3}
                                placeholder="A short description about yourself..."
                                disabled={isSubmitting}
                                className="w-full resize-none rounded-xl border border-border bg-bg-page px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/30 transition-all disabled:opacity-50"
                                {...register("bio")}
                            />
                            {errors.bio && (
                                <p className="text-xs text-error font-medium">{errors.bio.message}</p>
                            )}
                        </div>

                        {/* Avatar Selection */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-text-primary block">
                                Choose an Avatar
                            </Label>
                            <div className="grid grid-cols-5 gap-3">
                                {PREDEFINED_AVATARS.map((seed) => {
                                    const isSelected = avatarSeed === seed;
                                    return (
                                        <button
                                            key={seed}
                                            type="button"
                                            onClick={() => setValue("avatarSeed", seed)}
                                            className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${isSelected
                                                ? "border-accent ring-2 ring-accent/20 bg-accent/5"
                                                : "border-border hover:border-text-muted/50 hover:bg-bg-subtle bg-bg-page"
                                                }`}
                                        >
                                            <img
                                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`}
                                                alt={seed}
                                                className="w-full h-full object-cover p-1 select-none"
                                                draggable={false}
                                            />
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 bg-accent text-bg-page rounded-full w-4 h-4 flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M2 6l3 3 5-5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer — inside <form> so submit works */}
                    <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-border bg-bg-subtle/50 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-10 px-4"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            className="h-10 px-6 min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

EditProfileModal.displayName = "EditProfileModal";
