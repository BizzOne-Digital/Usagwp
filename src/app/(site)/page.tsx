import type { Metadata } from "next";

import { BookPanel } from "@/components/book/book-panel";
import { AuthorNote } from "@/components/marketing/author-note";
import { FourThreads } from "@/components/marketing/four-threads";
import { Hero } from "@/components/marketing/hero";
import { StayUpdated } from "@/components/marketing/stay-updated";
import { StoryIntro } from "@/components/marketing/story-intro";
import { TheSum } from "@/components/marketing/the-sum";
import { Timeline } from "@/components/marketing/timeline";
import { getBook } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("home", "/", {
    title: "One Thread in the Fabric of Freedom",
    description:
      "Edmond Kelly preserves and shares the true story of Reverend Edmond Kelly, born into slavery in 1817, who preached across America, England and Ireland to buy his family out of bondage. A forthcoming book by Peter Douet.",
  });
}

export default async function HomePage() {
  const book = await getBook();

  return (
    <>
      <Hero book={book} />
      <StoryIntro />
      <Timeline />
      <TheSum />
      <FourThreads />
      <BookPanel book={book} />
      <AuthorNote author={book.author} />
      <StayUpdated status={book.publicationStatus} />
    </>
  );
}
