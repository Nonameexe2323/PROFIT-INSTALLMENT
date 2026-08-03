import { Prompt, Inter } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "ระบบบันทึกกำไร & ยอดผ่อนชำระ (Profit & Installment Tracker)",
  description: "ระบบจดกำไรขายออก สรุปรายรับประจำเดือน และติดตามยอดผ่อนชำระลูกค้า",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${prompt.variable} ${inter.variable}`}>
      <body className="font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
