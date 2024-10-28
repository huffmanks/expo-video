import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";

export async function deleteVideo(videoId: string) {
  try {
    const [video] = await db
      .select({ fileUri: videos.fileUri })
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video || !video.fileUri) {
      console.log("Video not found in the database");
      return;
    }

    const fileInfo = await FileSystem.getInfoAsync(video.fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(video.fileUri);
      console.log("File deleted successfully:", video.fileUri);
    } else {
      console.log("File not found:", video.fileUri);
    }

    await db.delete(videos).where(eq(videos.id, videoId));
    console.log("Database entry deleted successfully:", videoId);
  } catch (error) {
    console.log("Error deleting video:", error);
  }
}