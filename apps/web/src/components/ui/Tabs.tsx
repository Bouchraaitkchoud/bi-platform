'use client';

import React, { ReactNode, useState } from 'react';

export interface TabConfig {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabConfig[];
  defaultActive?: string;
  activeTab?: string;
  onChange?: (activeId: string) => void;
  onTabChange?: (activeId: string) => void;
}

export function Tabs({ tabs, defaultActive, activeTab: externalActiveTab, onChange, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(externalActiveTab || defaultActive || tabs[0]?.id);

  // Update internal state if external activeTab changes
  React.useEffect(() => {
    if (externalActiveTab !== undefined && externalActiveTab !== activeTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab, activeTab]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
    onTabChange?.(id);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab);

  return (
    <div>
      {/* Tab Headers */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : 'transparent',
              position: 'relative',
              bottom: '-2px',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ paddingTop: '16px' }}>
        {activeContent?.content}
      </div>
    </div>
  );
}
