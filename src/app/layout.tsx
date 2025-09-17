
// import { Providers } from "@/components/shared/Providers";
// import { Navbar } from "@/components/shared/Navbar";
// import { AutoConnect } from "thirdweb/react";
// import { client } from "@/consts/client";
// import "./globals.css";
// import type { Metadata } from "next";
// import Providers from "./providers";

// export const metadata: Metadata = {
// 	title: "Marketplace",
// 	description: "UndeadBlocks UI",
// };

// export default function RootLayout({
// 	children,
// }: Readonly<{
// 	children: React.ReactNode;
// }>) {
// 	return (
// 		<html lang="en">
// 			<body style={{ paddingBottom: "100px" }}>
// 				<Providers>
// 					<AutoConnect client={client} />
// 					<Navbar />
// 					{children}
// 				</Providers>
// 			</body>
// 		</html>
// 	);
// }
import type { Metadata } from "next";
import Providers from "./providers";
import { Navbar } from "@/components/shared/Navbar";
import { AutoConnect } from "thirdweb/react";
import { client } from "@/consts/client";
// quita el import de "./globals.css" si no tienes el archivo

export const metadata: Metadata = {
  title: "Marketplace",
  description: "UndeadBlocks UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ paddingBottom: "100px" }}>
        <Providers>
          {/* Ahora sí: AutoConnect está DENTRO de ThirdwebProvider */}
          <AutoConnect client={client} />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
