import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";
import { getSessionAppRouter } from "@/lib/auth-utils-app";

export const dynamic = 'force-dynamic';

// Define tipe untuk searchQuery
interface SearchQuery {
  _id?: { $ne?: string; $in?: string[]; $nin?: string[] };
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  role?: string;
  status?: string;
}

// Define tipe untuk hasil query User
interface UserLean {
  _id: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  role?: string;
  status?: "online" | "away" | "offline";
  lastActive?: Date;
  connections?: string[];
  joinedDate?: Date;
  createdAt?: Date;
}

// Define tipe untuk currentUser
interface CurrentUserLean {
  _id?: string;
  connections?: string[];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAppRouter();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get query parameters
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const role = url.searchParams.get("role") || null;
    const status = url.searchParams.get("status") || null;
    const tab = url.searchParams.get("tab") || "all"; // all, following, suggested

    // Build search query
    const searchQuery: SearchQuery = {
      _id: { $ne: session.userId }, // Exclude current user
    };

    // Add search term if provided
    if (query && query.length >= 2) {
      searchQuery.$or = [
        { username: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ];
    }

    // Add optional filters
    if (role) searchQuery.role = role;
    if (status) searchQuery.status = status;

    // Get current user to check connections
    const currentUser = (await User.findById(session.userId)
      .select("connections")
      .lean()) as CurrentUserLean | null;
    const userConnections: string[] = currentUser?.connections || [];

    // Filter by tab
    if (tab === "following" && userConnections.length > 0) {
      searchQuery._id = { $in: userConnections };
    } else if (tab === "suggested") {
      // For suggested, exclude users the current user is already following
      if (userConnections.length > 0) {
        searchQuery._id = { $nin: [...userConnections, session.userId] };
      }
    }

    // Get total count for pagination
    const totalCount = await User.countDocuments(searchQuery);

    // Search users with pagination
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Search users
    const users = (await User.find(searchQuery)
    .select("_id username profilePicture bio role status lastActive connections joinedDate")
    .sort({ status: 1, lastActive: -1 })
    .skip(skip)
    .limit(limit)
    .lean()) as unknown as UserLean[];

    // Transform data for frontend
    const transformedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture || "",
      bio: user.bio || "",
      role: user.role || "member",
      status: user.status || "offline",
      lastActive: user.lastActive,
      connections: user.connections?.length || 0,
      joinedDate: user.joinedDate || user.createdAt,
      isFollowing: userConnections.some((id: string) => id === user._id),
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error searching users:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to search users", details: errorMessage }, { status: 500 });
  }
}