'use client';

import { Card, CardHeader, CardBody, Button, Chip, Input, Code, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Key, Copy, Plus, Trash2, Eye, EyeOff, Code2, Book, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export function APIDeveloperPortal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('keys');

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      keyPrefix: 'talixa_pk_live',
      scopes: ['read:employees', 'write:employees', 'read:leaves', 'write:leaves'],
      rateLimit: 5000,
      isActive: true,
      lastUsed: '2025-11-18T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Development Key',
      keyPrefix: 'talixa_pk_test',
      scopes: ['read:employees', 'read:attendance'],
      rateLimit: 1000,
      isActive: true,
      lastUsed: '2025-11-17T09:15:00Z',
      createdAt: '2024-06-01T14:00:00Z',
    },
  ]);

  const availableScopes = [
    { value: 'read:employees', label: 'Read Employees', category: 'Employees' },
    { value: 'write:employees', label: 'Write Employees', category: 'Employees' },
    { value: 'read:attendance', label: 'Read Attendance', category: 'Attendance' },
    { value: 'write:attendance', label: 'Write Attendance', category: 'Attendance' },
    { value: 'read:leaves', label: 'Read Leaves', category: 'Leaves' },
    { value: 'write:leaves', label: 'Write Leaves', category: 'Leaves' },
    { value: 'read:payroll', label: 'Read Payroll', category: 'Payroll' },
    { value: 'write:payroll', label: 'Write Payroll', category: 'Payroll' },
    { value: 'read:documents', label: 'Read Documents', category: 'Documents' },
    { value: 'write:documents', label: 'Write Documents', category: 'Documents' },
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/v1/employees',
      description: 'List all employees',
      scope: 'read:employees',
    },
    {
      method: 'POST',
      endpoint: '/api/v1/employees',
      description: 'Create a new employee',
      scope: 'write:employees',
    },
    {
      method: 'GET',
      endpoint: '/api/v1/employees/:id',
      description: 'Get employee details',
      scope: 'read:employees',
    },
    {
      method: 'PATCH',
      endpoint: '/api/v1/employees/:id',
      description: 'Update employee',
      scope: 'write:employees',
    },
    {
      method: 'GET',
      endpoint: '/api/v1/attendance',
      description: 'List attendance records',
      scope: 'read:attendance',
    },
    {
      method: 'POST',
      endpoint: '/api/v1/attendance/clock-in',
      description: 'Clock in an employee',
      scope: 'write:attendance',
    },
    {
      method: 'GET',
      endpoint: '/api/v1/leaves',
      description: 'List leave requests',
      scope: 'read:leaves',
    },
    {
      method: 'POST',
      endpoint: '/api/v1/leaves',
      description: 'Create leave request',
      scope: 'write:leaves',
    },
  ];

  const codeExamples = {
    curl: `curl -X GET 'https://api.talixa.com/v1/employees' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`,
    javascript: `const response = await fetch('https://api.talixa.com/v1/employees', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const employees = await response.json();
console.log(employees);`,
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.talixa.com/v1/employees',
    headers=headers
)

employees = response.json()
print(employees)`,
  };

  const handleCopyKey = () => {
    toast.success('API key copied to clipboard');
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast.success('API key revoked');
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
      GET: 'success',
      POST: 'primary',
      PATCH: 'warning',
      DELETE: 'danger',
    };
    return colors[method] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">API Developer Portal</h2>
              <p className="text-default-600">
                Build integrations with our RESTful API. Generate API keys, explore endpoints, and view documentation.
              </p>
            </div>
            <Button
              color="primary"
              startContent={<Book className="h-4 w-4" />}
              variant="bordered"
            >
              View Full Docs
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        size="lg"
        color="primary"
        variant="underlined"
      >
        <Tab
          key="keys"
          title={
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </div>
          }
        />
        <Tab
          key="endpoints"
          title={
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>Endpoints</span>
            </div>
          }
        />
        <Tab
          key="examples"
          title={
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span>Code Examples</span>
            </div>
          }
        />
      </Tabs>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="font-semibold">Your API Keys</h3>
                <Button color="primary" startContent={<Plus className="h-4 w-4" />} onPress={onOpen}>
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardBody className="gap-3">
              {apiKeys.map((key, index) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{key.name}</h4>
                            <Chip color={key.isActive ? 'success' : 'default'} variant="flat" size="sm">
                              {key.isActive ? 'Active' : 'Inactive'}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <code className="text-sm bg-default-100 px-2 py-1 rounded">
                              {showKey === key.id ? `${key.keyPrefix}_XXXXXXXXXXXXXXXX` : `${key.keyPrefix}_••••••••••••••••`}
                            </code>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => setShowKey(showKey === key.id ? null : key.id)}
                            >
                              {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={handleCopyKey}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {key.scopes.map(scope => (
                              <Chip key={scope} size="sm" variant="bordered">
                                {scope}
                              </Chip>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-default-500">
                            <span>Rate Limit: {key.rateLimit}/hour</span>
                            {key.lastUsed && (
                              <span>Last used: {new Date(key.lastUsed).toLocaleDateString('id-ID')}</span>
                            )}
                            <span>Created: {new Date(key.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          onPress={() => handleRevokeKey(key.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Available API Endpoints</h3>
            </CardHeader>
            <CardBody className="gap-2">
              {apiEndpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-4 p-4 bg-default-50 rounded-lg">
                    <Chip color={getMethodColor(endpoint.method)} variant="flat" size="sm" className="font-mono">
                      {endpoint.method}
                    </Chip>
                    <code className="flex-1 text-sm">{endpoint.endpoint}</code>
                    <p className="text-sm text-default-600">{endpoint.description}</p>
                    <Chip size="sm" variant="bordered">
                      {endpoint.scope}
                    </Chip>
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Code Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">cURL</h3>
            </CardHeader>
            <CardBody>
              <div className="relative">
                <pre className="bg-default-900 text-default-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples.curl}</code>
                </pre>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute top-2 right-2"
                  onPress={() => toast.success('Code copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">JavaScript / Node.js</h3>
            </CardHeader>
            <CardBody>
              <div className="relative">
                <pre className="bg-default-900 text-default-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples.javascript}</code>
                </pre>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute top-2 right-2"
                  onPress={() => toast.success('Code copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Python</h3>
            </CardHeader>
            <CardBody>
              <div className="relative">
                <pre className="bg-default-900 text-default-100 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExamples.python}</code>
                </pre>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute top-2 right-2"
                  onPress={() => toast.success('Code copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New API Key</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Key Name"
                    placeholder="e.g., Production API Key"
                    required
                  />
                  <Input
                    label="Rate Limit (requests/hour)"
                    placeholder="1000"
                    type="number"
                    defaultValue="1000"
                  />
                  <div>
                    <p className="text-sm font-medium mb-2">Scopes</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableScopes.map(scope => (
                        <div key={scope.value} className="flex items-center gap-2 p-2 hover:bg-default-50 rounded">
                          <input type="checkbox" id={scope.value} className="rounded" />
                          <label htmlFor={scope.value} className="flex-1 text-sm cursor-pointer">
                            {scope.label}
                            <span className="text-xs text-default-500 ml-2">({scope.category})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Create API Key
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
