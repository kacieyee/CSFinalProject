import { cookies } from "next/headers";
import RootLayoutClient from "./RootLayoutClient";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return (
    <RootLayoutClient token={token}>
      {children}
    </RootLayoutClient>
  );
}