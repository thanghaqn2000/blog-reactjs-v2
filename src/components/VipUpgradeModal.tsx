
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VipUpgradeForm from "@/components/VipUpgradeForm";
import { Lock } from "lucide-react";
import { useState } from "react";

interface VipUpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const VipUpgradeModal = ({ open, onClose }: VipUpgradeModalProps) => {
  const [showForm, setShowForm] = useState(false);

  const handleUpgradeClick = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  return (
    <>
      <Dialog open={open && !showForm} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Quyền truy cập VIP
            </DialogTitle>
            <DialogDescription>
              Nâng cấp lên VIP để truy cập nội dung độc quyền và nhận các gói dịch vụ tài chính.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium mb-2">Hiện tại lượt nhắn còn lại của bạn đã hết, hãy liên hệ với admin để nâng cấp thêm lượt nhắn</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Link zalo: <a href="https://zalo.me/0386666666" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">0386666666</a></li>
            </ul>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              variant="premium" 
              onClick={handleUpgradeClick}
            >
              Upgrade to VIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <VipUpgradeForm 
        open={showForm} 
        onClose={handleFormClose} 
        onCancel={() => {
          handleFormClose();
          onClose();
        }}
      />
    </>
  );
};

export default VipUpgradeModal;
