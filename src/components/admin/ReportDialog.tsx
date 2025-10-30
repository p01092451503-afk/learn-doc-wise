import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIReportGenerator } from "./AIReportGenerator";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportDialog = ({ open, onOpenChange }: ReportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI 리포트 생성</DialogTitle>
        </DialogHeader>
        <AIReportGenerator />
      </DialogContent>
    </Dialog>
  );
};
