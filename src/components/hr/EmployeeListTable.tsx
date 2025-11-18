'use client';

import { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
} from '@heroui/react';
import { MoreVertical, Eye, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Employee, ListEmployeesParams } from '@/lib/api/types';
import { employeeService } from '@/lib/api/services';
import { format } from 'date-fns';
import Link from 'next/link';

const columnHelper = createColumnHelper<Employee>();

const STATUS_COLOR_MAP = {
  active: 'success',
  inactive: 'warning',
  terminated: 'danger',
  resigned: 'default',
} as const;

const EMPLOYMENT_TYPE_MAP = {
  permanent: 'Permanent',
  contract: 'Contract',
  probation: 'Probation',
  intern: 'Intern',
  part_time: 'Part Time',
} as const;

interface EmployeeListTableProps {
  searchParams: {
    search?: string;
    status?: string;
    department?: string;
    position?: string;
    employmentType?: string;
    page?: string;
  };
}

export function EmployeeListTable({ searchParams }: EmployeeListTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        // TODO: Get actual employerId from auth context
        const params: ListEmployeesParams = {
          employerId: 'temp-employer-id',
          limit,
          offset,
        };

        if (searchParams.search) params.search = searchParams.search;
        if (searchParams.status) params.status = searchParams.status;
        if (searchParams.department) params.department = searchParams.department;
        if (searchParams.position) params.position = searchParams.position;
        if (searchParams.employmentType) params.employmentType = searchParams.employmentType;

        const response = await employeeService.list(params);
        setEmployees(response.employees);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setEmployees([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [searchParams, page]);

  // Define columns
  const columns = [
    columnHelper.accessor('employeeNumber', {
      header: 'Employee #',
      cell: (info) => (
        <span className="font-mono text-sm font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('fullName', {
      header: 'Name',
      cell: (info) => {
        const employee = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{info.getValue()}</span>
            <span className="text-xs text-gray-500">{employee.email}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('department', {
      header: 'Department',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('employmentType', {
      header: 'Type',
      cell: (info) => (
        <Chip size="sm" variant="flat">
          {EMPLOYMENT_TYPE_MAP[info.getValue()]}
        </Chip>
      ),
    }),
    columnHelper.accessor('employmentStatus', {
      header: 'Status',
      cell: (info) => (
        <Chip
          size="sm"
          color={STATUS_COLOR_MAP[info.getValue()]}
          variant="flat"
        >
          {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
        </Chip>
      ),
    }),
    columnHelper.accessor('joinDate', {
      header: 'Join Date',
      cell: (info) => (
        <span className="text-sm">
          {format(new Date(info.getValue()), 'MMM dd, yyyy')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const employee = info.row.original;
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Employee actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                as={Link}
                href={`/hr/employees/${employee.id}`}
              >
                View Details
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                as={Link}
                href={`/hr/employees/${employee.id}/edit`}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading employees..." />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 mb-4">No employees found</p>
        <Button as={Link} href="/hr/employees/new" color="primary">
          Add Your First Employee
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table
          aria-label="Employee list table"
          classNames={{
            wrapper: 'shadow-none',
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <TableColumn key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableColumn>
              ))
            )}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} employees
        </p>
        <Pagination
          total={totalPages}
          page={page}
          onChange={(newPage) => {
            const params = new URLSearchParams(searchParams);
            params.set('page', newPage.toString());
            window.location.href = `/hr/employees?${params.toString()}`;
          }}
        />
      </div>
    </div>
  );
}
