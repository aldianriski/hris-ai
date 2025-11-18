'use client';

import { Card, CardBody } from '@heroui/react';
import { Network } from 'lucide-react';

export function OrgChartPlaceholder() {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center justify-center py-20">
          <Network className="w-24 h-24 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Organization Chart</h3>
          <p className="text-gray-500 text-center max-w-md">
            Interactive org chart visualization will be implemented here using react-organizational-chart or d3-org-chart library
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Features: Drag-drop editing, department color coding, click to view details, export as PNG/PDF
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
