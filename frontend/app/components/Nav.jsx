import Link from "next/link";
import {useAuth} from "../hooks/auth";

export default function Nav() {
    const {user, logout, isLoading} = useAuth();

    return (
        <nav className={"flex justify-between items-center p-4"}>
            <div className={""}>
                <ul className={"flex space-x-4"}>
                    <Link href={"/"} className={"mr-2 ml-2"}>Home</Link>
                    <Link href={"#"} className={"mr-2 ml-2"}>About</Link>
                    <Link href={"/products"} className={"mr-2 ml-2"}>Product Cards</Link>
                </ul>
            </div>

            <div className={""}>
                {isLoading ? (
                    <div className="text-gray-600">Loading...</div>
                ) : (
                    user ? (
                        <div className={"flex justify-between items-center"}>
                            <span className={"text-sm font-bold pr-3"}>Hi, {user.name}!</span>
                            <a
                                href="#"
                                className={"hover:font-bold"}
                                onClick={logout}
                            >
                                Sign Out
                            </a>
                            </div>
                        ) : (
                        <div>
                            <Link className={"mr-5"} href={"/login"}>
                                Sing In
                            </Link>
                            <Link href={"/register"}>
                                Register
                            </Link>
                        </div>
                    )
                )}
            </div>
        </nav>
    );
}
