import { useState, useEffect } from "react";
import Layout from "../Componants/layout";
import '../css/BookCard.css';

const Institution = () => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchInstitutions();
  }, [filter]);

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter 
        ? `http://localhost:8000/api/institutions?filter=${filter}` 
        : 'http://localhost:8000/api/institutions';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data);
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading institutions...</div>;
  }

  return (
    
      <div className="container mx-auto p-6">
        <div className="page-header">
          <h1>Institutions</h1>
          <div className="filters">
            <button 
              className={filter === null ? 'active' : ''} 
              onClick={() => setFilter(null)}
            >
              All
            </button>
            <button 
              className={filter === 'university' ? 'active' : ''} 
              onClick={() => setFilter('university')}
            >
              Universities
            </button>
            <button 
              className={filter === 'school' ? 'active' : ''} 
              onClick={() => setFilter('school')}
            >
              Schools
            </button>
            <button 
              className={filter === 'library' ? 'active' : ''} 
              onClick={() => setFilter('library')}
            >
              Libraries
            </button>
          </div>
        </div>

        <div className="institution-grid">
          {institutions.length === 0 ? (
            <div className="empty-state">
              <p>No institutions found</p>
              <p>Create your first institution to start sharing books</p>
            </div>
          ) : (
            institutions.map(inst => (
              <div key={inst.id} className="institution-item">
                <div className="institution-card">
                  <div className="institution-header">
                    <h3>{inst.name}</h3>
                    <span className="institution-type">{inst.type}</span>
                  </div>
                  <p className="institution-description">{inst.description}</p>
                  <div className="institution-actions">
                    <button className="view-btn">View</button>
                    <button className="join-btn">Join</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
};

export default Institution;
