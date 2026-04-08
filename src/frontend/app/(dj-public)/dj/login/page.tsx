import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import DjLoginScreen from "@/features/dj/auth/login/DjLoginScreen";
import { Suspense } from "react";

export default function DjLoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner/>}>
      <DjLoginScreen />
    </Suspense>
  );
}
