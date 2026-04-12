import { useState, useEffect } from "react";
import Layout from "../Componants/layout";
import '../css/BookCard.css';

const Club = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchClubs();
  }, [filter]);

  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter 
        ? `http://localhost:8000/api/corporate-clubs?filter=${filter}` 
        : 'http://localhost:8000/api/corporate-clubs';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading clubs...</div>;
  }

  return (
      <div className="container mx-auto p-6">
        <div className="page-header">
          <h1>Corporate Clubs</h1>
          <div className="filters">
            <button 
              className={filter === null ? 'active' : ''} 
              onClick={() => setFilter(null)}
            >
              All
            </button>
            <button 
              className={filter === 'technology' ? 'active' : ''} 
              onClick={() => setFilter('technology')}
            >
              Technology
            </button>
            <button 
              className={filter === 'finance' ? 'active' : ''} 
              onClick={() => setFilter('finance')}
            >
              Finance
            </button>
            <button 
              className={filter === 'healthcare' ? 'active' : ''} 
              onClick={() => setFilter('healthcare')}
            >
              Healthcare
            </button>
          </div>
        </div>

        <div className="club-grid">
          {clubs.length === 0 ? (
            <div className="empty-state">
              <p>No corporate clubs found</p>
              <p>Create your first corporate club to start sharing books</p>
            </div>
          ) : (
            clubs.map(club => (
              <div key={club.id} className="club-item">
                <div className="club-card">
                  <div className="club-header">
                    <h3>{club.name}</h3>
                    <span className="club-type">{club.company_name}</span>
                  </div>
                  <p className="club-description">{club.description}</p>
                  <div className="club-actions">
                    <button className="join-btn">Join Club</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
};

export default Club;
