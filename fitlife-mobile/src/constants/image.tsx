
export const HERO_IMAGE: string =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&w=1200&q=80";

const TASK_ROTATION: string[] = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&w=800&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=800&q=80",
  "https://images.unsplash.com/photo-1575052814086-f986e126ef2d?auto=format&w=800&q=80",
  "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&w=800&q=80",
];

const SESSION_ROTATION: string[] = [
  "https://images.unsplash.com/photo-1518310952931-b1de897abd40?auto=format&w=800&q=80",
  "https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&w=800&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=800&q=80",
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&w=800&q=80",
];



type ImageItem = {
  id?: number | string;
  image_url?: string;
  image?: string;
  photo?: string;
  cover_url?: string;
  thumbnail?: string;
  studio_image?: string;
  instructor_photo?: string;
};



function firstUrl(obj: ImageItem | undefined, keys: (keyof ImageItem)[]): string | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.trim();
    }
  }
  return null;
}



export function taskImage(item: ImageItem, index: number = 0): string {
  return (
    firstUrl(item, ["image_url", "image", "photo", "cover_url", "thumbnail"]) ||
    TASK_ROTATION[
      Math.abs(Number(item?.id) || index) % TASK_ROTATION.length
    ]
  );
}

export function sessionImage(item: ImageItem, index: number = 0): string {
  return (
    firstUrl(item, [
      "image_url",
      "image",
      "photo",
      "cover_url",
      "studio_image",
      "instructor_photo",
    ]) ||
    SESSION_ROTATION[
      Math.abs(Number(item?.id) || index) % SESSION_ROTATION.length
    ]
  );
}