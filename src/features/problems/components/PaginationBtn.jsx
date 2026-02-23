export default function PaginationBtn({ children, active, disabled }) {
    return (
        <button
            disabled={disabled}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-normal
        ${active
                    ? "bg-accent text-white shadow-md font-bold"
                    : disabled
                        ? "border border-border text-text-muted cursor-not-allowed"
                        : "border border-border text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                }`}
        >
            {children}
        </button>
    );
}
