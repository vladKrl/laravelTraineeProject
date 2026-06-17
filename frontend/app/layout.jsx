import Layout from "./components/Layouts";
import "./styles/global.css";
import React, {Suspense} from "react";

export const metadata = {
    title: 'Kufar clone',
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
        <head />
        <body>
        <Layout>
            {children}
        </Layout>
        </body>
        </html>
    );
}