import React from 'react';

/**
 * Button Component
 * 
 * A reusable button with multiple variants and sizes.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content.
 * @param {'primary' | 'secondary' | 'ghost' | 'outline'} [props.variant='primary'] - Visual style.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size.
 * @param {string} [props.className] - Additional classes.
 * @returns {JSX.Element}
 */
export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
    // Base styles applied to all buttons
    const baseClasses = "rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20";

    // Visual variants
    const variants = {
        primary: "bg-primary hover:bg-emerald-700 text-white shadow-sm hover:shadow-md",
        secondary: "bg-white text-text-main hover:bg-zinc-50 border border-border-base shadow-sm",
        ghost: "bg-transparent text-text-muted hover:text-primary hover:bg-primary/5",
        outline: "bg-transparent border border-zinc-200 text-text-main hover:border-primary hover:text-primary"
    };

    // Size configurations
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-4 text-base"
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
