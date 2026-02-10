export const metadata = {
    title: 'Kufar clone',
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
        <head />
        <body>
        {children}
        </body>
        </html>
    );
}