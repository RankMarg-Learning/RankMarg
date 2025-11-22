import { Button } from "@repo/common-ui";
import { RefreshCw, Download } from "lucide-react";

interface CurriculumHeaderProps {
  onReset: () => void;
  onExport?: () => void;
}

export const CurriculumHeader = ({ onReset, onExport }: CurriculumHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">
          Curriculum Management
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your educational content hierarchy and exam configurations
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onReset} className="hover:bg-blue-50 hover:border-blue-200">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        {onExport && (
          <Button variant="outline" onClick={onExport} className="hover:bg-green-50 hover:border-green-200">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
};

