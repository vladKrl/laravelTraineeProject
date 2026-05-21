import Nav from "./Nav";
import Footer from "./Footer";

export default function Layouts({children}) {
    return (
        <div className={"flex flex-col min-h-screen bg-purple-400"}>
            <header className="bg-purple-300 max-w-full px-8 mx-auto w-full">
                <Nav />
            </header>

            <main className={"flex-grow mt-8"}>
                {children}
            </main>

            <Footer />
        </div>
    );
}
