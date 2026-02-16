import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAllFeeds, getFeedById } from '@/lib/rss';
import EventDetailClient from './EventDetailClient';

interface EventPageProps {
  params: { id: string };
}

// Generate static params for all feeds
export async function generateStaticParams() {
  try {
    const feeds = await fetchAllFeeds();
    return feeds.slice(0, 20).map((feed) => ({
      id: feed.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const feed = await getFeedById(params.id);
  
  if (!feed) {
    return {
      title: 'Event Not Found | PULSE',
    };
  }
  
  return {
    title: `${feed.title} | PULSE`,
    description: feed.content.substring(0, 160),
    openGraph: {
      title: feed.title,
      description: feed.content.substring(0, 160),
      type: 'article',
      publishedTime: feed.timestamp,
      authors: feed.author ? [feed.author] : undefined,
    },
  };
}

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function EventPage({ params }: EventPageProps) {
  const feed = await getFeedById(params.id);
  
  if (!feed) {
    notFound();
  }
  
  return <EventDetailClient feed={feed} />;
}
