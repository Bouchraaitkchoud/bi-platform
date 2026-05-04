// apps/web/src/features/datasets/components/DatabaseConnectionForm.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { datasetService } from '@/services/datasetService';
import { Loader2 } from 'lucide-react';

interface DatabaseConnectionFormProps {
  onSuccess: (dataset: any) => void;
}

const DatabaseConnectionForm: React.FC<DatabaseConnectionFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [description, setDescription] = useState('');
  const [dbType, setDbType] = useState<string | number>('postgresql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [user, setUser] = useState('postgres');
  const [password, setPassword] = useState('');
  const [dbname, setDbname] = useState('postgres');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM my_table LIMIT 100;');
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeConnection, setActiveConnection] = useState<any>(null);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const dbTypeOptions: SelectOption[] = [
    { label: 'PostgreSQL', value: 'postgresql' },
    { label: 'MySQL (coming soon)', value: 'mysql' },
  ];

  useEffect(() => {
    const loadActiveConnection = async () => {
      try {
        const response = await datasetService.getActiveDatabaseConnection();
        const details = response.db_connection_details;
        setActiveConnection(details);
        setDbType(details.db_type);
        setHost(details.host);
        setPort(String(details.port));
        setUser(details.user);
        setDbname(details.dbname);
      } catch {
        setActiveConnection(null);
      }
    };

    const loadQueryHistory = async () => {
      try {
        const response = await datasetService.getDatabaseQueryHistory();
        setQueryHistory(response.items || []);
      } catch {
        setQueryHistory([]);
      }
    };

    loadActiveConnection();
    loadQueryHistory();
  }, []);

  const handleSaveConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const connectionDetails = {
        db_type: dbType,
        host,
        port: parseInt(port, 10),
        user,
        password,
        dbname,
      };
      const response = await datasetService.setActiveDatabaseConnection({
        db_connection_details: connectionDetails,
      });
      setActiveConnection(response.db_connection_details);
      setPassword('');
      setIsConnectionModalOpen(false);
      alert('Connection saved successfully.');
    } catch (error: any) {
      const errorMsg = error.message || 'Could not save the connection.';
      setError(errorMsg);
      alert(`Error saving connection: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await datasetService.clearActiveDatabaseConnection();
      setActiveConnection(null);
      setPassword('');
      setIsConnectionModalOpen(false);
      alert('Connection cleared.');
    } catch (error: any) {
      const errorMsg = error.message || 'Could not clear the connection.';
      setError(errorMsg);
      alert(`Error clearing connection: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setError(null);
    try {
      const result = activeConnection && !password
        ? await datasetService.testActiveDatabaseQuery({ sql_query: sqlQuery })
        : await datasetService.testDatabaseConnection({
            db_connection_details: {
              db_type: dbType,
              host,
              port: parseInt(port, 10),
              user,
              password,
              dbname,
            },
            sql_query: sqlQuery,
          });
      setTestResult(result);
      try {
        const history = await datasetService.getDatabaseQueryHistory();
        setQueryHistory(history.items || []);
      } catch {
        setQueryHistory([]);
      }
      alert(`Connection successful! Found ${result.preview_data.columns.length} columns.`);
    } catch (error: any) {
      const errorMsg = error.message || "Could not connect to the database.";
      setError(errorMsg);
      alert(`Connection failed: ${errorMsg}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!testResult) {
      alert('Please test the connection first.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: datasetName,
        description,
        source_type: 'DATABASE',
        sql_query: sqlQuery,
      };
      if (!activeConnection || password) {
        payload.db_connection_details = {
          db_type: dbType,
          host,
          port: parseInt(port, 10),
          user,
          password,
          dbname,
        };
      }
      const newDataset = await datasetService.createDatasetFromDatabase(payload);
      alert(`Dataset "${newDataset.name}" created successfully!`);
      onSuccess(newDataset);
      try {
        const history = await datasetService.getDatabaseQueryHistory();
        setQueryHistory(history.items || []);
      } catch {
        setQueryHistory([]);
      }
    } catch (error: any) {
      const errorMsg = error.message || "An unexpected error occurred.";
      setError(errorMsg);
      alert(`Error creating dataset: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {activeConnection ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Connected to {activeConnection.user}@{activeConnection.host}:{activeConnection.port}/{activeConnection.dbname}
        </div>
      ) : null}
      
      <div>
        <label className="block text-sm font-medium mb-2">Dataset Name</label>
        <Input 
          value={datasetName} 
          onChange={(e) => setDatasetName(e.target.value)} 
          placeholder="e.g. 'Monthly Sales Data'" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <TextArea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="A brief description of the dataset" 
        />
      </div>
      
      {!activeConnection ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Database Type</label>
            <Select 
              options={dbTypeOptions}
              value={dbType} 
              onChange={setDbType}
              disabled={dbType === 'mysql'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Host</label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Port</label>
            <Input type="number" value={port} onChange={(e) => setPort(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input value={user} onChange={(e) => setUser(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Database Name</label>
            <Input value={dbname} onChange={(e) => setDbname(e.target.value)} required />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setIsConnectionModalOpen(true)}>
            Switch Connection
          </Button>
          <Button type="button" variant="outline" onClick={handleDisconnect} disabled={isLoading}>
            Disconnect
          </Button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">SQL Query</label>
        <TextArea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          placeholder="SELECT * FROM your_table;"
          rows={6}
          required
          className="font-mono text-sm"
        />
      </div>

      {queryHistory.length > 0 ? (
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium mb-2">Query History</label>
            <Button type="button" variant="outline" onClick={async () => {
              await datasetService.clearDatabaseQueryHistory();
              setQueryHistory([]);
            }}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {queryHistory.map((query, index) => (
              <Button
                key={`${query}-${index}`}
                type="button"
                variant="outline"
                onClick={() => setSqlQuery(query)}
              >
                {query.length > 60 ? `${query.slice(0, 60)}...` : query}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex justify-between items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTestConnection} 
          disabled={isTesting}
        >
          {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Test Connection
        </Button>
        <div className="flex gap-2">
          {!activeConnection ? (
            <Button type="button" variant="outline" onClick={handleSaveConnection} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Connection
            </Button>
          ) : null}
          <Button type="submit" disabled={isLoading || !testResult}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Dataset
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        title="Switch Connection"
        size="md"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Database Type</label>
            <Select 
              options={dbTypeOptions}
              value={dbType} 
              onChange={setDbType}
              disabled={dbType === 'mysql'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Host</label>
            <Input value={host} onChange={(e) => setHost(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Port</label>
            <Input type="number" value={port} onChange={(e) => setPort(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input value={user} onChange={(e) => setUser(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Database Name</label>
            <Input value={dbname} onChange={(e) => setDbname(e.target.value)} required />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setIsConnectionModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveConnection} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Connection
          </Button>
        </div>
      </Modal>
    </form>
  );
};

export default DatabaseConnectionForm;
