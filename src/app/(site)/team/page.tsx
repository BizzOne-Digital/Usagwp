import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { getPublishedTeam } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";
import { buttonClasses } from "@/lib/button-classes";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("team", "/team", {
    title: "Our team",
    description:
      "The people behind USAGWP and the publication of One Thread in the Fabric of Freedom.",
  });
}

export default async function TeamPage() {
  const team = await getPublishedTeam();

  return (
    <>
      <PageHeader
        title="The people behind the work"
        intro="Research, writing and publication are the work of a small group. Everyone listed here is part of bringing the record into print."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {team.length === 0 ? (
            <EmptyState
              title="Team profiles are being prepared"
              body="Profiles will appear here as they are added. In the meantime, Peter Douet can be reached directly."
              action={
                <Link
                  href="/contact"
                  className={buttonClasses("secondary", "md")}
                >
                  Contact us
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {team.map((member, index) => {
                const photo = resolveImageUrl(member.photo);
                return (
                  <Reveal as="li" key={member.id} delay={Math.min(index, 4) * 0.05}>
                    <article className="grid gap-6 py-10 md:grid-cols-[10rem_1fr] md:gap-10">
                      <div className="relative aspect-[4/5] w-32 overflow-hidden rounded-sm bg-bg-deep md:w-full">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={`Portrait of ${member.name}`}
                            fill
                            sizes="(max-width: 768px) 8rem, 10rem"
                            className="object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="flex h-full w-full items-center justify-center font-display text-3xl text-fg-muted"
                          >
                            {member.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="font-display text-[1.75rem] leading-tight text-fg">
                          {member.name}
                        </h2>
                        {member.role ? (
                          <p className="mt-1 text-sm text-accent">{member.role}</p>
                        ) : null}
                        {member.shortBio ? (
                          <p className="mt-4 max-w-[56ch] text-[1.0625rem] leading-relaxed text-fg-soft">
                            {member.shortBio}
                          </p>
                        ) : null}
                        {member.bio ? (
                          <p className="mt-3 max-w-[56ch] text-[0.9375rem] leading-relaxed text-fg-muted">
                            {member.bio}
                          </p>
                        ) : null}
                        {member.links.length > 0 ? (
                          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                            {member.links.map((link) => (
                              <li key={link.url}>
                                <a
                                  href={link.url}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                  className="text-sm text-fg-muted underline underline-offset-4 transition-colors hover:text-fg"
                                >
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
