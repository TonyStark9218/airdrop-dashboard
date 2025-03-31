import { Skeleton } from "@/components/ui/skeleton"

export function AirdropTableSkeleton() {
  return (
    <div className="rounded-lg border border-gray-700 bg-[#0f1623] overflow-hidden">
      <table className="w-full text-sm text-left text-gray-200">
        <thead className="text-xs uppercase bg-[#1a1f2e] text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">
              PROJECT
            </th>
            <th scope="col" className="px-4 py-3">
              LINK
            </th>
            <th scope="col" className="px-4 py-3">
              STATUS
            </th>
            <th scope="col" className="px-4 py-3">
              TWITTER
            </th>
            <th scope="col" className="px-4 py-3">
              DISCORD
            </th>
            <th scope="col" className="px-4 py-3">
              NOTES
            </th>
            <th scope="col" className="px-4 py-3">
              JOIN DATE
            </th>
            <th scope="col" className="px-4 py-3">
              CHAIN
            </th>
            <th scope="col" className="px-4 py-3">
              STAGE
            </th>
            <th scope="col" className="px-4 py-3">
              TYPE
            </th>
            <th scope="col" className="px-4 py-3">
              LAST ACTIVITY
            </th>
            <th scope="col" className="px-4 py-3">
              GUIDE
            </th>
            <th scope="col" className="px-4 py-3">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="px-4 py-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20 bg-gray-700 mb-2" />
                <Skeleton className="h-3 w-16 bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 rounded-full bg-gray-700 mr-2" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-16 bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

