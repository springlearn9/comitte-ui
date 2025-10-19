import React, { useState } from 'react';
import { Card, Button, Badge } from '@nextui-org/react';
import { Plus, Users, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import CreateEditCommitteeModal from './CreateEditCommitteeModal';
import type { CommitteeListItem } from '../../types/committee';
import type { Committee } from '../../types/committee';

// Mock data for demonstration
const mockCommittees: CommitteeListItem[] = [
  {
    id: '1',
    name: '1.05L/ 15M/ 7000/ 10Jan24',
    owner: 'Ajit Kastley',
    members: 15,
    description: 'Monthly savings committee',
    createdAt: '2024-01-10',
    budget: '₹10033',
    location: 'Mumbai'
  },
  {
    id: '2',
    name: '1.05L/ 15M/ 7000/ 15Jan24',
    owner: 'Ajit Kastley',
    members: 15,
    description: 'Investment committee',
    createdAt: '2024-01-15',
    budget: '₹10000',
    location: 'Mumbai'
  },
  {
    id: '3',
    name: '2L/ 16M/ 12500/ 15Jan24',
    owner: 'Bippan Khichra',
    members: 16,
    description: 'Large scale committee',
    createdAt: '2024-01-15',
    budget: '₹20593',
    location: 'Delhi'
  },
  {
    id: '4',
    name: '2L/ 16M/ 12500/ 05Mar24',
    owner: 'Bippan Khichra',
    members: 16,
    description: 'Spring committee',
    createdAt: '2024-03-05',
    budget: '₹20186',
    location: 'Delhi'
  },
  {
    id: '5',
    name: '2.4L/ 15M/ 16000/ 10Nov24',
    owner: 'Sanjay Tyagi',
    members: 12,
    description: 'High value committee',
    createdAt: '2024-11-10',
    budget: '₹35966',
    location: 'Gurgaon'
  },
  {
    id: '6',
    name: '1.5L/ 15M/ 10000/ 10Mar25',
    owner: 'Sanjay Tyagi',
    members: 8,
    description: 'Future planning committee',
    createdAt: '2025-03-10',
    budget: '₹12866',
    location: 'Gurgaon'
  },
  {
    id: '7',
    name: '1.05L/ 15M/ 7000/ 10Dec24',
    owner: 'Sundar Tyagi',
    members: 10,
    description: 'Year-end committee',
    createdAt: '2024-12-10',
    budget: '₹9800',
    location: 'Noida'
  },
  {
    id: '8',
    name: '1.5L/ 15M/ 10000/ 10Jul25',
    owner: 'Sundar Tyagi',
    members: 3,
    description: 'Summer committee',
    createdAt: '2025-07-10',
    budget: '₹4000',
    location: 'Noida'
  }
];

const CommitteeCard: React.FC<{ committee: CommitteeListItem; showOwner?: boolean; onEdit?: (committee: CommitteeListItem) => void; onDelete?: (id: string) => void }> = ({ 
  committee, 
  showOwner = false,
  onEdit,
  onDelete
}) => (
  <Card className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {committee.owner?.charAt(0) || 'C'}
          </span>
        </div>
        {showOwner && (
          <div>
            <p className="text-sm font-medium text-white">{committee.owner}</p>
            <Badge size="sm" color="default" variant="flat">
              {committee.members} members
            </Badge>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-lg font-bold text-white">{committee.budget}</p>
          <p className="text-xs text-gray-400">{committee.createdAt}</p>
        </div>
        <div className="flex flex-col gap-1 ml-2">
          <button 
            onClick={() => onEdit?.(committee)}
            className="p-1.5 hover:bg-gray-600 rounded text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit Committee"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => committee.id && onDelete?.(committee.id)}
            className="p-1.5 hover:bg-gray-600 rounded text-red-400 hover:text-red-300 transition-colors"
            title="Delete Committee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <h3 className="text-white font-medium mb-2">{committee.name}</h3>
    <p className="text-gray-400 text-sm mb-3">{committee.description}</p>
    
    <div className="flex items-center justify-between text-sm text-gray-400">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{committee.members}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{committee.createdAt}</span>
        </div>
        {committee.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{committee.location}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
);

const CommitteeGroup: React.FC<{ 
  owner: string; 
  committees: CommitteeListItem[]; 
  isExpanded: boolean; 
  onToggle: () => void;
  onEdit: (committee: CommitteeListItem) => void;
  onDelete: (id: string) => void;
}> = ({ owner, committees, isExpanded, onToggle, onEdit, onDelete }) => (
  <div className="mb-6">
    <div 
      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors mb-3"
      onClick={onToggle}
    >
      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold text-sm">{owner.charAt(0)}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium">{owner}</h3>
        <p className="text-gray-400 text-sm">{committees.length} committees</p>
      </div>
      <Badge color="default" variant="flat">
        {committees.length}
      </Badge>
    </div>
    
    {isExpanded && (
      <div className="space-y-3 ml-4">
        {committees.map((committee) => (
          <CommitteeCard 
            key={committee.id} 
            committee={committee} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </div>
);

const Committees: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('my-committees');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [committees, setCommittees] = useState<CommitteeListItem[]>(mockCommittees);

  // Mock current user
  const currentUser = 'Sanjay Tyagi';

  // Group committees by owner for "My Committees" tab
  const groupedCommittees = committees.reduce((groups, committee) => {
    const owner = committee.owner || 'Unknown';
    if (!groups[owner]) {
      groups[owner] = [];
    }
    groups[owner].push(committee);
    return groups;
  }, {} as Record<string, CommitteeListItem[]>);

  // Filter committees owned by current user for "All Committees" tab
  const myOwnedCommittees = committees.filter(
    committee => committee.owner === currentUser
  );

  const toggleGroup = (owner: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(owner)) {
      newExpanded.delete(owner);
    } else {
      newExpanded.add(owner);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCreateCommittee = () => {
    console.log('Create committee clicked'); // Debug log
    setModalMode('create');
    setSelectedCommittee(null);
    setIsModalOpen(true);
  };

  const handleEditCommittee = (committee: CommitteeListItem) => {
    console.log('Edit committee clicked:', committee); // Debug log
    // Convert CommitteeListItem to Committee for the modal
    const committeeForEdit: Committee = {
      id: committee.id,
      name: committee.name,
      description: committee.description,
      totalAmount: committee.budget?.replace('₹', '') || '',
      monthlyAmount: '',
      duration: '12',
      startDate: committee.createdAt || '',
      location: committee.location || '',
      maxMembers: committee.members || 10,
      category: 'savings',
      rules: ''
    };
    setModalMode('edit');
    setSelectedCommittee(committeeForEdit);
    setIsModalOpen(true);
  };

  const handleDeleteCommittee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this committee?')) {
      setCommittees(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveCommittee = async (committeeData: Committee) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modalMode === 'create') {
      const newCommittee: CommitteeListItem = {
        id: Date.now().toString(),
        name: committeeData.name,
        owner: currentUser,
        members: 1,
        description: committeeData.description,
        createdAt: new Date().toISOString().split('T')[0],
        budget: `₹${committeeData.totalAmount}`,
        location: committeeData.location
      };
      setCommittees(prev => [...prev, newCommittee]);
    } else if (selectedCommittee?.id) {
      setCommittees(prev => 
        prev.map(c => 
          c.id === selectedCommittee.id 
            ? { 
                ...c, 
                name: committeeData.name,
                description: committeeData.description,
                budget: `₹${committeeData.totalAmount}`,
                location: committeeData.location
              }
            : c
        )
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Committees</h1>
          <p className="text-gray-400">Manage and view all committees</p>
        </div>
        <Button
          startContent={<Plus className="w-4 h-4" />}
          className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-2 font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          onPress={handleCreateCommittee}
        >
          Add Committee
        </Button>
      </div>

      {/* Test button to force modal open */}
      <Button
        className="mb-4 bg-red-600 text-white"
        onPress={() => {
          console.log('Test button clicked');
          setIsModalOpen(true);
        }}
      >
        Test Modal
      </Button>

      {/* Custom Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('my-committees')}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
            activeTab === 'my-committees'
              ? 'bg-gray-700 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-750'
          }`}
        >
          My Committees
        </button>
        <button
          onClick={() => setActiveTab('all-committees')}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
            activeTab === 'all-committees'
              ? 'bg-gray-700 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-750'
          }`}
        >
          All Committees
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'my-committees' && (
        <div>
          <p className="text-gray-400 mb-4">
            Committees grouped by owner ({Object.keys(groupedCommittees).length} owners)
          </p>
          
          {Object.entries(groupedCommittees).map(([owner, committees]) => (
            <CommitteeGroup
              key={owner}
              owner={owner}
              committees={committees}
              isExpanded={expandedGroups.has(owner)}
              onToggle={() => toggleGroup(owner)}
              onEdit={handleEditCommittee}
              onDelete={handleDeleteCommittee}
            />
          ))}
        </div>
      )}

      {activeTab === 'all-committees' && (
        <div>
          <p className="text-gray-400 mb-4">
            Committees owned by you ({myOwnedCommittees.length} committees)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myOwnedCommittees.map((committee) => (
              <CommitteeCard 
                key={committee.id} 
                committee={committee} 
                showOwner={false} 
                onEdit={handleEditCommittee}
                onDelete={handleDeleteCommittee}
              />
            ))}
          </div>
        </div>
      )}

      {/* Simple test modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-black mb-4">Test Modal</h2>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Committee Modal */}
      <CreateEditCommitteeModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Modal close called'); // Debug log
          setIsModalOpen(false);
        }}
        onSave={handleSaveCommittee}
        committee={selectedCommittee}
        mode={modalMode}
      />
      
      {/* Debug info */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs">
        Modal Open: {isModalOpen.toString()}
      </div>
    </div>
  );
};

export default Committees;