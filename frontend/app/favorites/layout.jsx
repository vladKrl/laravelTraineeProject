"use client"

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "../styles/global.css";

export default function FavoritesLayout({children}) {
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
