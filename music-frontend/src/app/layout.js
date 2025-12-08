import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { PlayerProvider } from "../context/PlayerContext";
import Player from "../components/Player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "6rabyat Music",
  description: "Your favorite music streaming platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
