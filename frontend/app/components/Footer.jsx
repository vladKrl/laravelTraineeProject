import Link from "next/link";

export default function Footer() {
    return (
        <footer className={"items-center p-4 text-white bg-indigo-500"}>
            <div className={"max-w-7xl mx-auto px-4"}>
                <div className={"flex justify-center gap-8"}>

                    <div>
                        <h3 className={"text-white font-bold text-lg mb-4"}>KUFAR CLONE</h3>
                        <p className={"text-md text-indigo-200"}>
                            Platform to sell and buy usefull stuff! Search for products and give a second life to yours
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Info</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="hover:text-white transition">About us!</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={"border-t border-indigo-900 mt-5 pt-5 flex justify-between items-center text-xs text-indigo-300"}>
                    <p>© {new Date().getFullYear()} KUFAR CLONE.</p>
                    <div className="flex space-x-4">
                        <a href="#" className={"text-indigo-900"}>Telegram</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
