import React from 'react';

export const LearningResourcesCards = () => {
  // Placeholder data - replace with actual resources as needed
  const resources = [
    { id: 1, title: 'Resource 1', description: 'Description of resource 1' },
    { id: 2, title: 'Resource 2', description: 'Description of resource 2' },
    { id: 3, title: 'Resource 3', description: 'Description of resource 3' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 card-grid">
      {resources.map(res => (
        <div key={res.id} className="card-glass p-4">
          <h3 className="font-bold text-sm mb-2">{res.title}</h3>
          <p className="text-xs text-gray-600">{res.description}</p>
        </div>
      ))}
    </div>
  );
};

export default LearningResourcesCards;
