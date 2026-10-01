export type GroupMember = {
  id: number;
  role: string;
  name: string;
  regNo: string;
};

export const GROUP_NUMBER = 'G12';
export const GROUP_CODE = 'MOB-G12-4982';

export const LEADER: GroupMember = {
  id: 5,
  role: 'Group leader',
  name: 'Solomon Kamara',
  regNo: '2324982',
};

export const MEMBERS: GroupMember[] = [
  {id: 1, role: 'Product and UX lead', name: 'Hamody [FILL surname]', regNo: '25/27639'},
  {id: 2, role: 'Interface engineer', name: 'Alexander Dyujay Kpande', regNo: '25/27596'},
  {id: 3, role: 'State and navigation engineer', name: 'Christine NDATIMANA', regNo: '[FILL]'},
  {id: 4, role: 'Device integration and QA lead', name: 'Alain Sauverain ISHEMA', regNo: '25/27343'},
  LEADER,
];
