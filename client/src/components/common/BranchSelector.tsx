import { ChevronDown } from 'lucide-react';
import { useBranch } from '@/context/BranchContext';
import { useLanguage } from '@/context/LanguageContext';

export function BranchSelector() {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();
  const { t } = useLanguage();

  return (
    <div className="relative">
      <select
        value={selectedBranchId || ''}
        onChange={(e) => setSelectedBranchId(parseInt(e.target.value))}
        className="bg-primary-900 text-white border border-primary-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 appearance-none pr-8"
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white w-4 h-4 pointer-events-none" />
    </div>
  );
}
