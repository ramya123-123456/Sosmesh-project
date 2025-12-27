import { Alert } from '@/contexts/AppContext';

export const OFFLINE_HISTORY: Alert[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    tags: ['injury'],
    description: 'Fell from bike, minor cuts on hand. Need first aid assistance.',
    severity: 'Medium',
    location: '17.3850, 78.4867',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    completed: false,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    phone: '9123456789',
    tags: ['lost'],
    description: 'Lost in unfamiliar area near metro station. Phone battery low.',
    severity: 'Medium',
    location: '28.6139, 77.2090',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    completed: true,
  },
  {
    id: '3',
    name: 'Amit Patel',
    phone: '9987654321',
    tags: ['trapped'],
    description: 'Stuck in elevator between 5th and 6th floor. Emergency help needed.',
    severity: 'High',
    location: '19.0760, 72.8777',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    completed: true,
  },
  {
    id: '4',
    name: 'Sunita Reddy',
    phone: '9555666777',
    tags: ['food'],
    description: 'Family of 4 without food for 2 days due to flood situation.',
    severity: 'High',
    location: '13.0827, 80.2707',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    completed: false,
  },
  {
    id: '5',
    name: 'Vikram Singh',
    phone: '9444333222',
    tags: ['suspicious'],
    description: 'Suspicious activity near school area. Multiple unknown persons.',
    severity: 'Medium',
    location: '26.9124, 75.7873',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    completed: true,
  },
  {
    id: '6',
    name: 'Meera Joshi',
    phone: '9111222333',
    tags: ['other'],
    description: 'Power outage in residential area for 6+ hours. Need generator support.',
    severity: 'Low',
    location: '18.5204, 73.8567',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
    completed: false,
  },
];