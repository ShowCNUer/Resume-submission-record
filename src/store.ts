import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { Application, Status, DEFAULT_STATUSES } from './types';

interface Store {
  applications: Application[];
  statuses: Status[];
  addApplication: (app: any) => void;
  updateApplication: (id: string, app: any) => void;
  deleteApplication: (id: string) => void;
  addStatus: (status: any) => void;
  updateStatus: (id: string, status: any) => void;
  deleteStatus: (id: string) => void;
  importFromExcel: (file: File) => Promise<void>;
  exportToExcel: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      applications: [],
      statuses: DEFAULT_STATUSES,
      
      addApplication: (app) => {
        const now = new Date().toISOString();
        const newApp = {
          ...app,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          applications: [newApp, ...state.applications],
        }));
      },
      
      updateApplication: (id, app) => {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, ...app, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },
      
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        }));
      },
      
      addStatus: (status) => {
        const newStatus = {
          ...status,
          id: Date.now().toString(),
          isDefault: false,
        };
        set((state) => ({
          statuses: [...state.statuses, newStatus],
        }));
      },
      
      updateStatus: (id, status) => {
        set((state) => ({
          statuses: state.statuses.map((s) =>
            s.id === id ? { ...s, ...status } : s
          ),
        }));
      },
      
      deleteStatus: (id) => {
        set((state) => ({
          statuses: state.statuses.filter((s) => s.id !== id),
        }));
      },
      
      importFromExcel: async (file: File) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        const { statuses } = get();
        const now = new Date().toISOString();
        
        const newApplications = jsonData.map((row) => {
          let statusId = statuses[0].id;
          if (row.status) {
            const foundStatus = statuses.find((s) => s.name === row.status);
            if (foundStatus) statusId = foundStatus.id;
          }
          
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            companyName: row.companyName || row['公司名称'] || '',
            position: row.position || row['岗位'] || '',
            url: row.url || row['官网URL'] || '',
            statusId,
            applicationDate: row.applicationDate || row['投递日期'] || new Date().toISOString().split('T')[0],
            customFields: {},
            createdAt: now,
            updatedAt: now,
          };
        });
        
        set((state) => ({
          applications: [...newApplications, ...state.applications],
        }));
      },
      
      exportToExcel: () => {
        const { applications, statuses } = get();
        
        const exportData = applications.map((app) => {
          const status = statuses.find((s) => s.id === app.statusId);
          const row: any = {
            '公司名称': app.companyName,
            '岗位': app.position,
            '官网URL': app.url || '',
            '状态': status?.name || '',
            '投递日期': app.applicationDate,
          };
          
          Object.entries(app.customFields).forEach(([key, value]) => {
            row[key] = value;
          });
          
          return row;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '投递记录');
        XLSX.writeFile(workbook, '简历投递记录_' + new Date().toISOString().split('T')[0] + '.xlsx');
      },
    }),
    {
      name: 'job-application-tracker',
    }
  )
);
