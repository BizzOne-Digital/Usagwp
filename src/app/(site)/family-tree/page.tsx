import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { getPublishedTeam, getSiteSettings } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";
import { buttonClasses } from "@/lib/button-classes";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("team", "/family-tree", {
    title: "Family Tree",
    description:
      "The line of descent from Reverend Edmond Kelly, born into slavery in Columbia, Tennessee, in 1817, to the family today.",
  });
}

export default async function FamilyTreePage() {
  const [team, settings] = await Promise.all([getPublishedTeam(), getSiteSettings()]);
  const familyTree = resolveImageUrl(settings.familyTreeImage);

  return (
    <>
      <PageHeader
        title="Family Tree"
        intro="The line of descent from Reverend Edmond Kelly to the family today. The chart shows the tree as it has been traced so far, and every person on record is listed beneath it."
      />

      {familyTree ? (
        <section className="bg-bg pt-14 md:pt-16">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal>
              <figure className="mx-auto max-w-[64rem]">
                <Image
                  src={familyTree}
                  alt={settings.familyTreeImageAlt || "Family tree of Reverend Edmond Kelly"}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 1024px) 100vw, 64rem"
                  className="h-auto w-full rounded-sm border border-line bg-bg-deep object-contain"
                />
                {settings.familyTreeImageAlt ? (
                  <figcaption className="mt-3 text-sm text-fg-muted">
                    {settings.familyTreeImageAlt}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {team.length === 0 ? (
            <EmptyState
              title="Family tree entries are being prepared"
              body="Individual records are added here as each one is verified against the archive. In the meantime, Peter Douet can be reached directly."
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
