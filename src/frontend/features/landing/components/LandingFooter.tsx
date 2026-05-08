import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/shared/constants/routes";
import { landingContent } from "../content";

export function LandingFooter() {
  return (
    <footer className="mt-20 border-t border-muted-20 pt-8">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={routes.dj.signup}>Create account</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.dj.login}>Log in</Link>
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Questions? {landingContent.footer.supportEmail}
      </p>
    </footer>
  );
}