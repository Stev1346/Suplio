import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/shared/constants/routes";
import { landingContent } from "../content";

export function LandingFooter() {
  return (
    <footer className="mt-20 border-t border-muted-20 pt-8">
      <div className="grid md:grid-cols-2 w-80 mx-auto gap-3">
        <Button asChild>
          <Link href={routes.dj.signup}>Create account</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="bg-primary-10 hover:bg-primary-40 hover:border-primary-40"
        >
          <Link href={routes.dj.login}>Log in</Link>
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Questions?{" "}
        <a href={`mailto:${landingContent.footer.supportEmail}`} className="hover:underline">
          {landingContent.footer.supportEmail}
        </a>
      </p>
    </footer>
  );
}
