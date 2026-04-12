import { useState, useEffect } from "react";
import Layout from "../Componants/layout";
import '../css/BookCard.css';

const Marketplace = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter 
        ? `http://localhost:8000/api/marketplace?filter=${filter}` 
        : 'http://localhost:8000/api/marketplace';
        
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
      console.error('Failed to fetch marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading marketplace items...</div>;
  }

  return (
    
      <div className="container mx-auto p-6">
        <div className="page-header">
          <h1>Book Marketplace</h1>
          <div className="filters">
            <button 
              className={filter === null ? 'active' : ''} 
              onClick={() => setFilter(null)}
            >
              All
            </button>
            <button 
              className={filter === 'fiction' ? 'active' : ''} 
              onClick={() => setFilter('fiction')}
            >
              Fiction
            </button>
            <button 
              className={filter === 'non-fiction' ? 'active' : ''} 
              onClick={() => setFilter('non-fiction')}
            >
              Non-Fiction
            </button>
            <button 
              className={filter === 'textbook' ? 'active' : ''} 
              onClick={() => setFilter('textbook')}
            >
              Textbooks
            </button>
          </div>
        </div>

        <div className="marketplace-grid">
          {items.length === 0 ? (
            <div className="empty-state">
              <p>No marketplace items found</p>
              <p>List your first book to start selling</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="marketplace-item">
                <div className="marketplace-card">
                  <div className="marketplace-header">
                    <h3>{item.title}</h3>
                    <span className="item-price">${item.price}</span>
                  </div>
                  <p className="item-author">{item.author}</p>
                  <p className="item-condition">{item.condition}</p>
                  <div className="item-actions">
                    <button className="view-btn">View Details</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    
  );
};

export default Marketplace;
