"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import useResponsive from "@/hooks/useResponsive";

interface MobileNavigationProps {
  navigation: { id: string; name: string; icon: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNavigation({ navigation, activeTab, setActiveTab }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useResponsive();
  
  // Only render on mobile devices
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 p-2">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setActiveTab('overview')}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs">Overview</span>
          </Button>
        </div>
        
        <div className="flex-1 flex justify-center">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setActiveTab('leads')}
          >
            <span className="text-xl">👥</span>
            <span className="text-xs">Leads</span>
          </Button>
        </div>
        
        <div className="flex-1 flex justify-center">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setActiveTab('pipeline')}
          >
            <span className="text-xl">📈</span>
            <span className="text-xs">Pipeline</span>
          </Button>
        </div>
        
        <div className="flex-1 flex justify-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                <Menu className="h-5 w-5" />
                <span className="text-xs">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <div className="grid grid-cols-3 gap-4 pt-6">
                {navigation
                  .filter(item => !['overview', 'leads', 'pipeline'].includes(item.id))
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => {
                        setActiveTab(item.id);
                        setOpen(false);
                      }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs">{item.name}</span>
                    </Button>
                  ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}