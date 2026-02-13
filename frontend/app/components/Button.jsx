export default function Button({type="submit", className="", ...props}) {
    return (
        <button
            type={type}
            className={`${className} px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition duration-150 ease-in-out`}
            {...props}
        />
    )
}