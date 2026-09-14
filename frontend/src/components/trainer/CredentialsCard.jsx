import React from 'react';

export const CredentialsCard = () => {
  // Placeholder credentials - replace with actual data as needed
  const credentials = [
    { id: 1, title: 'Credential A', description: 'Details about Credential A' },
    { id: 2, title: 'Credential B', description: 'Details about Credential B' },
    { id: 3, title: 'Credential C', description: 'Details about Credential C' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 card-grid">
      {credentials.map(cred => (
        <div key={cred.id} className="card-glass p-4">
          <h3 className="font-bold text-sm mb-2">{cred.title}</h3>
          <p className="text-xs text-gray-600">{cred.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CredentialsCard;
