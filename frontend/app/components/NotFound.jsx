import Link from "next/link";

export default function NotFound({ title = 'page', message = 'Such page does not found!', backLink = '/', backText = 'Go to main page'}) {
    return (
        <div className={"px-4 flex flex-col items-center justify-center min-h-[50vh] text-center"}>
            <h2 className={"mb-3 text-blue-900 text-3xl font-bold"}>
                {title}
            </h2>

            <p className={"mb-4 text-blue-900 text-xl max-w-md"}>
                {message}
            </p>

            <Link
                href={backLink}
                className={"px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 font-medium rounded-md shadow"}
            >
                {backText}
            </Link>
        </div>
    );
}
