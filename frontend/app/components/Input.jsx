export default function Input({disabled = false, className="", ...props}) {
    return (
        <input
            disabled={disabled}
            className={`${className} bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body`}
            {...props}
        />
    )
}
