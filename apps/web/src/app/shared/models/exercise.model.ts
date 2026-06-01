export interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory?: string
  equipment: string;
  force?: string;
  level: string;
  description?: string;
  instructions?: string;
  imageUrl?: string;
  isCustom?: boolean;
}
