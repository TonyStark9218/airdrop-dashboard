import { connectToDatabase } from "../lib/db"
import { User } from "../lib/models/user"

async function migrateUsers() {
  try {
    console.log("Starting user migration...")
    await connectToDatabase()

    // Find all users that don't have the new fields
    const users = await User.find({
      $or: [
        { profilePicture: { $exists: false } },
        { role: { $exists: false } },
        { status: { $exists: false } },
        { connections: { $exists: false } },
        { settings: { $exists: false } },
      ],
    })

    console.log(`Found ${users.length} users to migrate`)

    // Update each user with default values
    for (const user of users) {
      // Set default values for new fields
      if (!user.profilePicture) user.profilePicture = ""
      if (!user.bio) user.bio = ""
      if (!user.role) user.role = "member"
      if (!user.status) user.status = "offline"
      if (!user.lastActive) user.lastActive = new Date()
      if (!user.connections) user.connections = []
      if (!user.joinedDate) user.joinedDate = user.createdAt || new Date()
      if (!user.settings) {
        user.settings = {
          theme: "dark",
          notifications: true,
          language: "id",
        }
      }

      await user.save()
      console.log(`Migrated user: ${user.username}`)
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    process.exit(0)
  }
}

migrateUsers()
