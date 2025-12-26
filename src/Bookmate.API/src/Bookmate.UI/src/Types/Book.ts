export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  published_date?: string | null;
  purchased_date?: string | null;
  image_url?: string | null;
  // status: "Owned" | "Wishlist";
}