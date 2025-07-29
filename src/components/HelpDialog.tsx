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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageCircle, Bot } from "lucide-react";
import AIChatbot from "./AIChatbot";

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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Need Help?</DialogTitle>
          <DialogDescription>
            Get instant help with our AI assistant or contact our support team.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="ai-chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai-chat" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-chat" className="mt-4">
            <AIChatbot />
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start gap-3 h-auto p-4"
                onClick={() => window.open('mailto:support@pickmehop.com', '_self')}
              >
                <Mail className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Email us</div>
                  <div className="text-sm text-muted-foreground">support@pickmehop.com</div>
                </div>
              </Button>
              
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start gap-3 h-auto p-4"
                onClick={() => window.open('https://wa.me/33666357139', '_blank')}
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-sm text-muted-foreground">Chat with us instantly</div>
                </div>
              </Button>
              
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Available 24/7 for immediate assistance
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;