export default function CheckboxGroup({ label, count, checkboxColorClass, textColorClass, ringColorClass }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    className={`w-4 h-4 rounded border-border ${checkboxColorClass || ''} ${ringColorClass || 'focus:ring-2 focus:ring-accent'}`}
                />
                <span className={`${textColorClass || 'text-text-primary'} text-sm font-medium`}>{label}</span>
            </div>
            <span className="text-text-muted text-xs font-mono">{count}</span>
        </label>
    );
}
