// apps/web/src/features/datasets/components/DatabaseConnectionForm.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/Select';
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

  const dbTypeOptions: SelectOption[] = [
    { label: 'PostgreSQL', value: 'postgresql' },
    { label: 'MySQL (coming soon)', value: 'mysql' },
  ];

  const handleTestConnection = async () => {
    setIsTesting(true);
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
      const result = await datasetService.testDatabaseConnection({ 
        db_connection_details: connectionDetails, 
        sql_query: sqlQuery 
      });
      setTestResult(result);
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
      const connectionDetails = {
        db_type: dbType,
        host,
        port: parseInt(port, 10),
        user,
        password,
        dbname,
      };
      const newDataset = await datasetService.createDatasetFromDatabase({
        name: datasetName,
        description,
        source_type: 'DATABASE',
        db_connection_details: connectionDetails,
        sql_query: sqlQuery,
      });
      alert(`Dataset "${newDataset.name}" created successfully!`);
      onSuccess(newDataset);
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
        <Button type="submit" disabled={isLoading || !testResult}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Dataset
        </Button>
      </div>
    </form>
  );
};

export default DatabaseConnectionForm;
