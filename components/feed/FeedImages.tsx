import { View, Image } from 'react-native';

interface FeedImagesProps {
  images: string[];
}

export function FeedImages({ images }: FeedImagesProps) {
  if (!images || images.length === 0) return null;

  const count = images.length;

  return (
    <View className="mb-3 flex-row flex-wrap gap-1.5">
      {images.slice(0, 4).map((img, idx) => (
        <Image
          key={idx}
          source={{ uri: img }}
          className={`bg-muted ${
            count === 1
              ? 'h-64 w-full rounded-2xl'
              : count === 2
                ? 'h-48 w-[49%] rounded-xl'
                : 'h-32 w-[49%] rounded-xl'
          }`}
          resizeMode="cover"
        />
      ))}
    </View>
  );
}
