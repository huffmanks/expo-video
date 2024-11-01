import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

export default function WatchModal() {
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [videoUri, setVideoUri] = useState("");

  const { id } = useLocalSearchParams<{ id: string }>();
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      setVideoUri(video?.videoUri || "");
      videoRef?.current?.presentFullscreenPlayer();

      await ScreenOrientation.unlockAsync();
    };

    fetchVideo().catch((error) => console.error("Failed to fetch video:", error));

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT).catch((error) =>
        console.error("Failed to lock orientation:", error)
      );
    };
  }, [id]);

  return (
    <View className="w-full flex-1">
      <Video
        ref={videoRef}
        style={{ flex: 1 }}
        source={{
          uri: videoUri,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        shouldPlay
        onPlaybackStatusUpdate={(prev) => setStatus(prev)}
      />
    </View>
  );
}
