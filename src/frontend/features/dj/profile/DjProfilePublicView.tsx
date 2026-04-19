"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DjProfileResponse } from "@/lib/client/api/dj";
import { User } from "lucide-react";

export type DjProfilePublicFields = Pick<
  DjProfileResponse,
  | "stage_name"
  | "bio"
  | "avatar_url"
  | "website"
  | "social_links"
  | "contact_info"
>;

type Props = {
  profile: DjProfilePublicFields;
};

export function DjProfilePublicView({ profile }: Props) {
  return (
    <Card className="grid gap-6 bg-muted-20 w-full max-w-xl ">
      <CardHeader className="flex items-center gap-4">
        {profile.avatar_url ? (
          <Avatar className="lg:h-40 lg:w-40 h-25 w-25 rounded-full object-fill">
            <AvatarImage
              src={profile.avatar_url}
              alt={`${profile.stage_name} avatar`}
              width={100}
              height={100}
              className="rounded-full object-fill"
            />
          </Avatar>
        ) : (
          <Avatar className="lg:h-40 lg:w-40 h-25 w-25 rounded-full object-fill">
            <AvatarFallback className="bg-muted-40">
              <User className="text-muted-95"  width={90} height={90}/>
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex  flex-col">
          <h1 className="text-4xl text-primary-95 font-semibold">
            {profile.stage_name}
          </h1>
          {profile.website && (
            <a
              href={profile.website}
              className="text-accent-80 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Website
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {profile.bio && (
          <p className="text-muted-80 whitespace-pre-wrap">{profile.bio}</p>
        )}
        {profile.social_links &&
          Object.values(profile.social_links).length > 0 && (
            <section className=" mt-4">
              <h2 className="text-xl text-accent-80">Socials</h2>
              <ul className="space-y-1">
                {Object.entries(profile.social_links).map(([label, url]) => (
                  <li key={label}>
                    <span className="capitalize text-muted-60">{label}: </span>
                    <a
                      href={url}
                      className="text-accent-80 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        {(profile.contact_info?.email || profile.contact_info?.phone) && (
          <section className="mt-4 text-muted-80">
            <h2 className="text-xl text-accent-80">Contact</h2>
            {profile.contact_info?.email && (
              <div className="flex flex-row gap-2">
                <p>Email: </p>
                <a href={`mailto:${profile.contact_info.email}`}>
                  {profile.contact_info.email}
                </a>
              </div>
            )}
            {profile.contact_info?.phone && (
              <div className="flex flex-row gap-2">
                <p>Phone: </p>
                <a
                  href={`tel:${profile.contact_info.phone.replace(/\s/g, "")}`}
                >
                  {profile.contact_info.phone}
                </a>
              </div>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
