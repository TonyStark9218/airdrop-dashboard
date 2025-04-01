import { SearchBar } from "@/components/search-bar"
import { getSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { getAllAirdrops } from "@/lib/airdrop-actions"
import { ExploreResults } from "@/components/explore-results"
import { Search, Filter, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface ExplorePageProps {
  searchParams: { q?: string }
}

// Popular categories for explore page
const popularCategories = [
  { name: "Layer 2", icon: "🔗", color: "from-blue-600/20 to-blue-400/20", link: "?q=layer%202" },
  { name: "DeFi", icon: "💰", color: "from-green-600/20 to-green-400/20", link: "?q=defi" },
  { name: "Gaming", icon: "🎮", color: "from-purple-600/20 to-purple-400/20", link: "?q=gaming" },
  { name: "NFT", icon: "🖼️", color: "from-pink-600/20 to-pink-400/20", link: "?q=nft" },
  { name: "DAO", icon: "🏛️", color: "from-yellow-600/20 to-yellow-400/20", link: "?q=dao" },
  { name: "Privacy", icon: "🔒", color: "from-red-600/20 to-red-400/20", link: "?q=privacy" },
]

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const query = searchParams.q || ""
  const results = query ? await getAllAirdrops(query) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Explore Airdrops
        </h1>
        <p className="text-gray-400 max-w-2xl text-center">
          Search for airdrops across the community. Find new opportunities and add them to your dashboard.
        </p>
        <div className="w-full max-w-2xl mt-4">
          <SearchBar />
        </div>
      </div>

      {query && (
        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-white flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-400" />
              Results for {`"${query}"`}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
          <ExploreResults results={results} query={query} userId={session.userId} />
        </div>
      )}

      {!query && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                  Trending Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Ethereum L2", "Solana Airdrops", "DeFi Tokens", "Gaming NFTs", "Retroactive", "Testnet"].map(
                    (term) => (
                      <Link
                        key={term}
                        href={`/dashboard/explore?q=${encodeURIComponent(term)}`}
                        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 hover:from-blue-900/30 hover:to-purple-900/30 border border-gray-700 rounded-lg p-3 text-center transition-all duration-300"
                      >
                        <span className="text-gray-300 text-sm">{term}</span>
                      </Link>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { user: "alex92", action: "added", project: "Ethereum L2" },
                  { user: "crypto_hunter", action: "shared", project: "DeFi Protocol" },
                  { user: "nft_lover", action: "completed", project: "Gaming Token" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center border border-gray-700">
                      <span className="text-white font-medium">{activity.user.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="text-gray-300">
                      <span className="font-medium text-blue-400">{activity.user}</span> {activity.action}{" "}
                      <span className="text-purple-400">{activity.project}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-medium text-white mb-6">Popular Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {popularCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/dashboard/explore${category.link}`}
                  className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${category.color.split(" ")[0]}, ${category.color.split(" ")[1]})`,
                  }}
                >
                  <span className="text-3xl mb-2">{category.icon}</span>
                  <span className="text-white font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

