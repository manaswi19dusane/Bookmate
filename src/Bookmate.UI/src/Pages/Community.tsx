import { useState, useEffect } from "react";
import Layout from "../Componants/layout";
import '../css/BookCard.css';

const Community = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [filter]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter 
        ? `http://localhost:8000/api/community-groups?filter=${filter}` 
        : 'http://localhost:8000/api/community-groups';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch community groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading community groups...</div>;
  }

  return (
      <div className="container mx-auto p-6">
        <div className="page-header">
          <h1>Community Groups</h1>
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
              className={filter === 'business' ? 'active' : ''} 
              onClick={() => setFilter('business')}
            >
              Business
            </button>
          </div>
        </div>

        <div className="group-grid">
          {groups.length === 0 ? (
            <div className="empty-state">
              <p>No community groups found</p>
              <p>Create your first community group to start sharing books</p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.id} className="group-item">
                <div className="group-card">
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    <span className="group-type">{group.category}</span>
                  </div>
                  <p className="group-description">{group.description}</p>
                  <div className="group-actions">
                    <button className="join-btn">Join</button>
                    <button className="view-btn">View</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
};

export default Community;
