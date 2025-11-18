'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem } from '@heroui/react';
import {
  Play,
  Users,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  GitBranch,
  Database,
} from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start: Leave Request Submitted' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  start: { label: 'Start', icon: Play, color: '#10b981' },
  approval: { label: 'Approval', icon: CheckCircle, color: '#8b5cf6' },
  aiDecision: { label: 'AI Decision', icon: Zap, color: '#f59e0b' },
  condition: { label: 'Condition', icon: GitBranch, color: '#3b82f6' },
  notification: { label: 'Notification', icon: Mail, color: '#6366f1' },
  delay: { label: 'Delay/Wait', icon: Clock, color: '#ef4444' },
  action: { label: 'Action', icon: Database, color: '#14b8a6' },
  end: { label: 'End', icon: CheckCircle, color: '#10b981' },
};

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: type === 'start' ? 'input' : type === 'end' ? 'output' : 'default',
      data: { label: `${nodeTypes[type as keyof typeof nodeTypes].label} Node` },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Toolbox */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Workflow Nodes</h3>
          </CardHeader>
          <CardBody className="gap-2">
            {Object.entries(nodeTypes).map(([key, { label, icon: Icon, color }]) => (
              <Button
                key={key}
                variant="flat"
                className="justify-start"
                startContent={<Icon className="h-4 w-4" style={{ color }} />}
                onPress={() => addNode(key)}
              >
                {label}
              </Button>
            ))}
          </CardBody>
        </Card>

        {selectedNode && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Node Properties</h3>
            </CardHeader>
            <CardBody className="gap-4">
              <Input
                label="Label"
                value={selectedNode.data.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    )
                  );
                }}
              />
              <Select label="Assignee" placeholder="Select assignee">
                <SelectItem key="manager" value="manager">Manager</SelectItem>
                <SelectItem key="hr" value="hr">HR Team</SelectItem>
                <SelectItem key="ai" value="ai">AI Auto-Approve</SelectItem>
              </Select>
              <Input label="Timeout (hours)" type="number" defaultValue="24" />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Canvas */}
      <div className="col-span-12 lg:col-span-9">
        <Card className="h-full">
          <CardBody className="p-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNode(node)}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
