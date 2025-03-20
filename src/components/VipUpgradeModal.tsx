
import { useState } from "react";
import { Lock } from "lucide-react";
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
              <Lock className="h-5 w-5 text-primary" /> Exclusive VIP Content
            </DialogTitle>
            <DialogDescription>
              Upgrade to VIP membership to unlock exclusive financial news and insights.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
              <h3 className="font-medium mb-2">VIP Benefits:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Exclusive market analysis</li>
                <li>Priority access to financial reports</li>
                <li>Expert investment strategies</li>
                <li>Real-time market alerts</li>
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
