import { useFinancialRecords } from './useFinancialRecords';

// Simple test to verify the hook returns an array
const TestComponent = () => {
  const { data: records = [], isLoading } = useFinancialRecords();

  if (isLoading) return <div>Loading...</div>;

  // This should work now
  const filtered = records.filter(r => r.type === 'INCOME');

  return <div>Records: {records.length}, Filtered: {filtered.length}</div>;
};

export default TestComponent;