// API utilities for Open Library and external services

export interface Book {
  key: string;
  title: string;
  author: string;
  year: number | string;
  coverId?: number;
  pdfUrl?: string;
  link?: string;
  subjects?: string[];
  description?: string;
  publisher?: string;
  isbn?: string[];
}

export interface SearchOptions {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  books: Book[];
  totalResults: number;
  hasMore: boolean;
}

// Fetch books from Open Library
export async function fetchBooks(options: SearchOptions): Promise<SearchResult> {
  const { query, category, limit = 20, offset = 0 } = options;

  try {
    // Build search query with category if provided
    let searchQuery = query;
    if (category && category !== 'all') {
      searchQuery = `${query} ${category}`;
    }

    const fields = 'key,title,author_name,first_publish_year,cover_i,subject,ebook_access,publisher,isbn';
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=${limit}&offset=${offset}&fields=${fields}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status}`);
    }

    const data = await res.json();

    const books: Book[] = data.docs.map((doc: any) => ({
      key: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] || 'Unknown Author',
      year: doc.first_publish_year || 'N/A',
      coverId: doc.cover_i,
      subjects: doc.subject?.slice(0, 5) || [],
      pdfUrl: doc.ebook_access === 'public' ? `https://openlibrary.org${doc.key}.pdf` : undefined,
      link: `https://openlibrary.org${doc.key}`,
      publisher: doc.publisher?.[0],
      isbn: doc.isbn?.slice(0, 3)
    }));

    return {
      books,
      totalResults: data.numFound || 0,
      hasMore: data.docs.length === limit
    };
  } catch (err) {
    console.error('Error fetching books:', err);
    return {
      books: [],
      totalResults: 0,
      hasMore: false
    };
  }
}

// Get book details by key
export async function getBookDetails(bookKey: string): Promise<Book | null> {
  try {
    const res = await fetch(`https://openlibrary.org${bookKey}.json`);

    if (!res.ok) {
      throw new Error('Failed to fetch book details');
    }

    const data = await res.json();

    return {
      key: bookKey,
      title: data.title || 'Unknown Title',
      author: 'Unknown Author', // Would need another API call for author
      year: data.first_publish_date || 'N/A',
      description: typeof data.description === 'string'
        ? data.description
        : data.description?.value || '',
      subjects: data.subjects?.slice(0, 10) || []
    };
  } catch (err) {
    console.error('Error fetching book details:', err);
    return null;
  }
}

// Get cover URL
export function getCoverUrl(coverId?: number, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

// Get author info
export async function getAuthor(authorKey: string): Promise<any> {
  try {
    const res = await fetch(`https://openlibrary.org/authors/${authorKey}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Search with debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
