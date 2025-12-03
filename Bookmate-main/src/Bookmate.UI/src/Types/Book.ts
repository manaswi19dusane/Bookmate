export interface Book {
  id: number;
  title: string;
  author: string;
  status: "Owned" | "Wishlist";
}