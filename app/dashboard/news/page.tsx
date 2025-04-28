import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { redirect } from "next/navigation"
import { Newspaper, Twitter, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Mock news data (in a real app, this would come from Twitter API)
const mockNews = [
  {
    id: "1",
    title: "Ethereum Layer 2 Airdrop Season Heats Up",
    source: "CryptoNews",
    date: "2 hours ago",
    content:
      "Multiple Ethereum Layer 2 projects are rumored to be planning airdrops in the coming weeks. Users who have been active on these networks may be eligible.",
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Ethereum+L2",
    link: "#",
  },
  {
    id: "2",
    title: "New DeFi Protocol Announces Retroactive Airdrop",
    source: "DeFi Daily",
    date: "5 hours ago",
    content:
      "A new DeFi protocol has announced a retroactive airdrop for early users. The snapshot has already been taken, with distribution planned for next month.",
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=DeFi",
    link: "#",
  },
  {
    id: "3",
    title: "Solana Ecosystem Projects Hint at Upcoming Airdrops",
    source: "Crypto Insider",
    date: "1 day ago",
    content:
      "Several projects in the Solana ecosystem have hinted at upcoming airdrops for active users. Community members are speculating about which projects might be next.",
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Solana",
    link: "#",
  },
  {
    id: "4",
    title: "Major Exchange Launches Airdrop Platform",
    source: "CryptoExchange News",
    date: "2 days ago",
    content:
      "A major cryptocurrency exchange has launched a dedicated platform for airdrops, making it easier for projects to distribute tokens to eligible users.",
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Exchange",
    link: "#",
  },
]

export default async function NewsPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Crypto News</h1>
        <p className="text-gray-400 max-w-2xl text-center">
          Stay updated with the latest news about airdrops, crypto projects, and market trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockNews.map((item) => (
          <div key={item.id} className="bg-[#1a1f2e] border border-gray-700 rounded-lg overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-400 text-sm flex items-center">
                  <Twitter className="h-4 w-4 mr-1" />
                  {item.source}
                </span>
                <span className="text-gray-400 text-sm">{item.date}</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 mb-4">{item.content}</p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Read More
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6 mt-8">
        <div className="flex items-center mb-4">
          <Newspaper className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-medium text-white">Twitter Integration</h2>
        </div>
        <p className="text-gray-400 mb-4">
          We&apos;re working on integrating with Twitter&apos;s API to bring you real-time updates from the most trusted crypto
          news sources and influencers.
        </p>
        <p className="text-gray-400">
          Soon, you&apos;ll be able to customize your news feed based on your interests, follow specific accounts, and get
          notifications for breaking news.
        </p>
      </div>
    </div>
  )
}

