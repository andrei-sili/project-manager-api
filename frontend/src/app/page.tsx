// frontend/src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("access");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
