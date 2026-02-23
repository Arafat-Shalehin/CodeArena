import { Checkbox } from '@/components/ui/checkbox';

export default function CheckboxGroup({ label, count, checkboxColorClass, textColorClass, ringColorClass, checked, onCheckedChange }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
                <Checkbox
                    className={`data-[state=checked]:${checkboxColorClass} ${ringColorClass}`}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
                <span className={`${textColorClass || 'text-text-primary'} text-sm font-medium`}>{label}</span>
            </div>
            <span className="text-text-muted text-xs font-mono">{count}</span>
        </label>
    );
}


