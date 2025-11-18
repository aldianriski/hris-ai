/**
 * Employee Table Component
 * Displays list of employees with filtering and actions
 */

'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Mail, Phone, Edit, Trash2 } from 'lucide-react';

interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar?: string;
}

interface EmployeeTableProps {
  employees?: Employee[];
  onAdd?: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

const defaultEmployees: Employee[] = [
  {
    id: '1',
    employeeNumber: 'EMP001',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    phone: '+628123456789',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    status: 'active',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    employeeNumber: 'EMP002',
    name: 'John Doe',
    email: 'john@company.com',
    phone: '+628123456790',
    department: 'Marketing',
    position: 'Marketing Manager',
    status: 'active',
    joinDate: '2023-03-20',
  },
  {
    id: '3',
    employeeNumber: 'EMP003',
    name: 'Maria Garcia',
    email: 'maria@company.com',
    phone: '+628123456791',
    department: 'HR',
    position: 'HR Specialist',
    status: 'active',
    joinDate: '2023-06-10',
  },
];

export function EmployeeTable({
  employees = defaultEmployees,
  onAdd,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === 'all' || employee.department === selectedDepartment;

    const matchesStatus =
      selectedStatus === 'all' || employee.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your team members and their information
          </p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {employee.name[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(employee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(employee)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredEmployees.length}</span> of{' '}
          <span className="font-medium">{employees.length}</span> employees
        </p>
      </div>
    </div>
  );
}
