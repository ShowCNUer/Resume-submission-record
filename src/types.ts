export interface Application {
  id: string;
  companyName: string;
  position: string;
  url?: string;
  statusId: string;
  applicationDate: string;
  customFields: Record<string, string>;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export const DEFAULT_STATUSES: Status[] = [
  { id: '1', name: '待投递', color: '#9ca3af', isDefault: true },
  { id: '2', name: '已投递', color: '#2563eb', isDefault: true },
  { id: '3', name: '面试中', color: '#f59e0b', isDefault: true },
  { id: '4', name: '已Offer', color: '#10b981', isDefault: true },
  { id: '5', name: '已拒绝', color: '#ef4444', isDefault: true },
];
