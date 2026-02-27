export interface Book {
  title: string;
  author: string;
  pdfUrl?: string;
  coverId?: number;
}

export async function fetchBooks(query: string = "programming"): Promise<Book[]> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
    if (!res.ok) throw new Error("Failed to fetch books");

    const data = await res.json();
    return data.docs.map((doc: any) => ({
      title: doc.title,
      author: doc.author_name?.[0] || "Unknown",
      pdfUrl: doc.ebook_access === "public" ? `https://openlibrary.org${doc.key}.pdf` : undefined,
      coverId: doc.cover_i,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}