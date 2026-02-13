import Nav from "./Nav";
import Footer from "./Footer";

const Layouts = ({children}) => {
    return (
        <div className="bg-purple-400">
            <div className="bg-purple-300 max-w-xl px-8 mx-auto">
                <Nav />
            </div>
            <div className="mt-8">
                {children}
            </div>
            <Footer />
        </div>
    );
}

export default Layouts;