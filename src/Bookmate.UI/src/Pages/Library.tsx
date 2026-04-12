import { useState, useEffect } from 'react';
import BookCard from '../Componants/BookCard';
import '../css/wishlist.css';

interface LibraryItem {
  id: string;
  book_id: string;
  added_at: string;
  status: string;
  progress?: number;
  notes?: string;
}

const Library = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, [filter]);

  const fetchLibrary = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter 
        ? `http://localhost:8000/api/library?status=${filter}` 
        : 'http://localhost:8000/api/library';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/library/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchLibrary();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/library/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchLibrary();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading library...</div>;
  }

  return (
    <div className="library-page">
      <div className="page-header">
        <h1>My Library</h1>
        <div className="filters">
          <button 
            className={filter === null ? 'active' : ''} 
            onClick={() => setFilter(null)}
          >
            All
          </button>
          <button 
            className={filter === 'reading' ? 'active' : ''} 
            onClick={() => setFilter('reading')}
          >
            Reading
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={filter === 'wishlist' ? 'active' : ''} 
            onClick={() => setFilter('wishlist')}
          >
            Wishlist
          </button>
        </div>
      </div>

      <div className="library-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your library is empty</p>
            <p>Start adding books to your collection!</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="library-item">
              <BookCard bookId={item.book_id} showActions={false} />
              <div className="item-actions">
                <select 
                  value={item.status} 
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                >
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="archived">Archived</option>
                </select>
                <button 
                  className="remove-btn" 
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;