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
  // The SEO key stays "team": it is the stored Page.key, renaming it would
  // orphan any saved override.
  return generatePageMetadata("team", "/lineage", {
    title: "Lineage",
    description:
      "The line of descent from Reverend Edmond Kelly, born into slavery in Columbia, Tennessee, in 1817, to the family today.",
  });
}

export default async function LineagePage() {
  const [team, settings] = await Promise.all([getPublishedTeam(), getSiteSettings()]);
  const lineageImage = resolveImageUrl(settings.familyTreeImage);

  return (
    <>
      <PageHeader
        title="Lineage"
        intro="The line of descent from Reverend Edmond Kelly to the family today, traced generation by generation."
      />

      {lineageImage ? (
        <section className="bg-bg pt-14 md:pt-16">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal>
              <figure className="mx-auto max-w-[64rem]">
                <Image
                  src={lineageImage}
                  alt={settings.familyTreeImageAlt || "Lineage of Reverend Edmond Kelly"}
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
              title="Lineage entries are being prepared"
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
            <ol className="mx-auto flex max-w-[42rem] flex-col items-center">
              {team.map((member, index) => {
                const photo = resolveImageUrl(member.photo);
                return (
                  <li key={member.id} className="flex w-full flex-col items-center">
                    {/* Arrow and entry reveal separately: one Reveal around the
                        whole <li> fires while the previous entry is still on
                        screen, so the animation is over before this one is. */}
                    {index > 0 ? (
                      <Reveal>
                        <Image
                          src="/brand/arr.png"
                          alt=""
                          aria-hidden
                          width={381}
                          height={524}
                          className="my-8 h-14 w-auto opacity-70"
                        />
                      </Reveal>
                    ) : null}

                    <Reveal
                      delay={index > 0 ? 0.12 : 0}
                      className="flex w-full flex-col items-center text-center"
                    >
                      {/* object-contain, not cover: these are archive photographs
                          and a crop cuts people out of the frame. */}
                      <div className="flex h-60 w-full max-w-[26rem] items-center justify-center overflow-hidden rounded-sm bg-bg-deep md:h-72">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={`Portrait of ${member.name}`}
                            width={832}
                            height={576}
                            sizes="(max-width: 768px) 100vw, 26rem"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span aria-hidden className="font-display text-3xl text-fg-muted">
                            {member.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-6 font-display text-[1.75rem] leading-tight text-fg">
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
                        <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
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
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
