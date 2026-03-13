export default function Button({type="submit", className="", ...props}) {
    return (
        <button
            type={type}
            className={`${className} flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg transition-all px-4 hover:bg-indigo-700 transition duration-150 ease-in-out`}
            {...props}
        />
    )
}