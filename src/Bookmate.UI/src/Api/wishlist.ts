const KEY = "wishlist";

export function getWishlist(): string[] {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function toggleWishlist(id: string) {
  const list = getWishlist();

  if (list.includes(id)) {
    const updated = list.filter((x) => x !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } else {
    list.push(id);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function isInWishlist(id: string): boolean {
  return getWishlist().includes(id);
}
