import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

interface HelpDialogProps {
  children: React.ReactNode;
}

const HelpDialog = ({ children }: HelpDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Need Help?</DialogTitle>
          <DialogDescription>
            Get in touch with us for any questions or assistance with your booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-3 h-auto p-4"
              onClick={() => window.open('mailto:support@pickmehop.com', '_self')}
            >
              <Mail className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Email us</div>
                <div className="text-sm text-muted-foreground">support@pickmehop.com</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-3 h-auto p-4"
              onClick={() => window.open('https://wa.me/33666357139', '_blank')}
            >
              <MessageCircle className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm text-muted-foreground">Chat with us instantly</div>
              </div>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Available 24/7 for your assistance
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;