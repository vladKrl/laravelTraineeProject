import Nav from "./Nav";
import Footer from "./Footer";

export default function Layouts({children}) {
    return (
        <div className="bg-purple-400">
            <div className="bg-purple-300 max-w-full px-8 mx-auto">
                <Nav />
            </div>
            <div className="mt-8">
                {children}
            </div>
            <Footer />
        </div>
    );
}
