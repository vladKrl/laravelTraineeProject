export default function Errors({errors = {}, ...props}) {
    const errorList = Array.isArray(errors) ? errors : Object.values(errors).flat();

    if (errorList.length === 0) return null;

    return (
        <>
            <div {...props}>
                <div className={"text-red-700 font-bold"}>
                    Error!
                </div>

                <ul className={"mt-2 text-red-700 text-sm"}>
                    {errorList.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>
        </>
    )
}
