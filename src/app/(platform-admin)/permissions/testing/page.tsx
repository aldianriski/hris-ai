'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Tabs,
  Tab,
  Input,
  Textarea,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  CheckCircle2,
  XCircle,
  Play,
  Plus,
  AlertTriangle,
  Shield,
  Users,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  permissions_to_test: Array<{ permission: string; expected: boolean }>;
  last_run_at?: string;
  last_run_result?: {
    total: number;
    passed: number;
    failed: number;
  };
  is_active: boolean;
}

interface TestResult {
  permission: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
}

interface Conflict {
  permission: string;
  conflict_type: string;
  granting_roles: any;
  denying_roles: any;
}

export default function PermissionTestingPage() {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [selectedTab, setSelectedTab] = useState('quick-test');

  // Quick Test State
  const [testUserId, setTestUserId] = useState('');
  const [testPermissions, setTestPermissions] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  // Conflict Detection State
  const [conflictUserId, setConflictUserId] = useState('');
  const [detectingConflicts, setDetectingConflicts] = useState(false);

  useEffect(() => {
    fetchScenarios();
    fetchConflicts();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/permissions/scenarios');
      if (!response.ok) throw new Error('Failed to fetch scenarios');

      const data = await response.json();
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast.error('Failed to load test scenarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchConflicts = async () => {
    try {
      const response = await fetch('/api/platform/permissions/conflicts');
      if (!response.ok) return;

      const data = await response.json();
      setConflicts(data.conflicts || []);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    }
  };

  const runQuickTest = async () => {
    if (!testUserId || !testPermissions) {
      toast.error('Please enter user ID and permissions');
      return;
    }

    try {
      setTesting(true);
      const permissions = testPermissions
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p)
        .map((p) => ({ permission: p }));

      const response = await fetch('/api/platform/permissions/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: testUserId,
          permissions,
        }),
      });

      if (!response.ok) throw new Error('Test failed');

      const data = await response.json();
      setTestResults(data.results || []);
      toast.success(`Test complete: ${data.summary.passed}/${data.summary.total} passed`);
    } catch (error) {
      console.error('Error running test:', error);
      toast.error('Failed to run permission test');
    } finally {
      setTesting(false);
    }
  };

  const runScenario = async (scenarioId: string) => {
    try {
      const response = await fetch(
        `/api/platform/permissions/scenarios/${scenarioId}/run`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) throw new Error('Failed to run scenario');

      const data = await response.json();
      toast.success(`Test complete: ${data.summary.passed}/${data.summary.total} passed`);
      await fetchScenarios();
    } catch (error) {
      console.error('Error running scenario:', error);
      toast.error('Failed to run scenario');
    }
  };

  const detectConflicts = async () => {
    if (!conflictUserId) {
      toast.error('Please enter user ID');
      return;
    }

    try {
      setDetectingConflicts(true);
      const response = await fetch(
        `/api/platform/permissions/conflicts?userId=${conflictUserId}`
      );

      if (!response.ok) throw new Error('Failed to detect conflicts');

      const data = await response.json();
      setConflicts(data.conflicts || []);
      toast.success(
        `Found ${data.conflicts?.length || 0} conflict${data.conflicts?.length === 1 ? '' : 's'}`
      );
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      toast.error('Failed to detect conflicts');
    } finally {
      setDetectingConflicts(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Permission Testing & Simulation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Test and verify RBAC permissions for users and roles
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        classNames={{
          tabList: 'w-full relative rounded-none border-b border-gray-200 dark:border-gray-700',
          cursor: 'w-full bg-primary',
          tab: 'max-w-fit px-6 h-12',
          tabContent: 'group-data-[selected=true]:text-primary',
        }}
      >
        <Tab
          key="quick-test"
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Quick Test</span>
            </div>
          }
        >
          <div className="py-6 space-y-6">
            <Card>
              <CardBody className="p-6 space-y-4">
                <Input
                  label="User ID"
                  placeholder="Enter user UUID"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  description="The user ID to test permissions for"
                />

                <Textarea
                  label="Permissions to Test"
                  placeholder="employee.create&#10;employee.read&#10;payroll.process"
                  value={testPermissions}
                  onChange={(e) => setTestPermissions(e.target.value)}
                  description="Enter one permission per line"
                  minRows={6}
                />

                <Button
                  color="primary"
                  startContent={<Play className="w-4 h-4" />}
                  onPress={runQuickTest}
                  isLoading={testing}
                >
                  Run Test
                </Button>
              </CardBody>
            </Card>

            {/* Results */}
            {testResults.length > 0 && (
              <Card>
                <CardBody className="p-0">
                  <Table aria-label="Test results">
                    <TableHeader>
                      <TableColumn>PERMISSION</TableColumn>
                      <TableColumn>RESULT</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {testResults.map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <code className="text-sm">{result.permission}</code>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={result.actual ? 'success' : 'danger'}
                              variant="flat"
                              startContent={
                                result.actual ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )
                              }
                            >
                              {result.actual ? 'Granted' : 'Denied'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {result.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>

        <Tab
          key="scenarios"
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Test Scenarios</span>
            </div>
          }
        >
          <div className="py-6 space-y-6">
            {scenarios.length === 0 ? (
              <Card>
                <CardBody className="p-12 text-center text-gray-500 dark:text-gray-400">
                  No test scenarios found
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id}>
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {scenario.name}
                          </h3>
                          {scenario.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {scenario.description}
                            </p>
                          )}
                        </div>
                        <Chip
                          size="sm"
                          color={scenario.is_active ? 'success' : 'default'}
                          variant="flat"
                        >
                          {scenario.is_active ? 'Active' : 'Inactive'}
                        </Chip>
                      </div>

                      <div className="space-y-3 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Permissions:</strong> {scenario.permissions_to_test.length}{' '}
                          tests
                        </p>

                        {scenario.last_run_result && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm">
                                {scenario.last_run_result.passed} passed
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm">
                                {scenario.last_run_result.failed} failed
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Play className="w-4 h-4" />}
                        onPress={() => runScenario(scenario.id)}
                        fullWidth
                      >
                        Run Scenario
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tab>

        <Tab
          key="conflicts"
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Conflict Detection</span>
            </div>
          }
        >
          <div className="py-6 space-y-6">
            <Card>
              <CardBody className="p-6 space-y-4">
                <Input
                  label="User ID"
                  placeholder="Enter user UUID"
                  value={conflictUserId}
                  onChange={(e) => setConflictUserId(e.target.value)}
                  description="Detect permission conflicts for this user"
                />

                <Button
                  color="warning"
                  startContent={<AlertTriangle className="w-4 h-4" />}
                  onPress={detectConflicts}
                  isLoading={detectingConflicts}
                >
                  Detect Conflicts
                </Button>
              </CardBody>
            </Card>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <Card>
                <CardBody className="p-0">
                  <Table aria-label="Permission conflicts">
                    <TableHeader>
                      <TableColumn>PERMISSION</TableColumn>
                      <TableColumn>CONFLICT TYPE</TableColumn>
                      <TableColumn>GRANTING ROLES</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {conflicts.map((conflict, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <code className="text-sm">{conflict.permission}</code>
                          </TableCell>
                          <TableCell>
                            <Chip size="sm" color="warning" variant="flat">
                              {conflict.conflict_type.replace('_', ' ')}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {Array.isArray(conflict.granting_roles)
                                ? conflict.granting_roles.length
                                : 0}{' '}
                              roles
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            )}

            {conflicts.length === 0 && conflictUserId && (
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardBody className="p-6">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <p>No permission conflicts detected</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
