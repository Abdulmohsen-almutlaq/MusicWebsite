import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { PlayerProvider } from "../context/PlayerContext";
import Player from "../components/Player";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata = {
  title: "6rabyat Music",
  description: "Your favorite music streaming platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <AuthProvider>
          <PlayerProvider>
            <div className="flex flex-col h-screen">
              <div className="flex-1 overflow-hidden">
                {children}
              </div>
              <Player />
            </div>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
