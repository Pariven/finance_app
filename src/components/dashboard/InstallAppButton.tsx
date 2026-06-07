'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, Apple, Monitor, Share, Plus, MoreVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InstallAppButton() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('android');

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      if (typeof window !== 'undefined') {
        const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isIOSStandalone = (window.navigator as any).standalone === true;
        setIsStandalone(isStandaloneMatch || isIOSStandalone);
      }
    };

    // Detect user OS for pre-selecting instructions tab
    const detectOS = () => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
          setActiveTab('ios');
        } else if (/android/.test(userAgent)) {
          setActiveTab('android');
        } else {
          setActiveTab('desktop');
        }
      }
    };

    checkStandalone();
    detectOS();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable && deferredPrompt) {
      // If native PWA install prompt is supported, show it
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Otherwise (iOS, Firefox, or other browsers), open instructions modal
      setDialogOpen(true);
    }
  };

  // If already installed, hide the install button
  if (isStandalone) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-lg transition-all glow-purple hover:opacity-90 animate-fade-in"
        style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}
      >
        <Download className="w-4 h-4" />
        Download App
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Download className="w-5 h-5 text-primary animate-pulse" />
              Download FinancePro
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Install the app on your home screen for quick, fullscreen access.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted border border-border p-1 rounded-xl mb-4">
              <TabsTrigger value="android" className="flex items-center gap-1.5 justify-center py-2 text-xs">
                <Smartphone className="w-3.5 h-3.5" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios" className="flex items-center gap-1.5 justify-center py-2 text-xs">
                <Apple className="w-3.5 h-3.5" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-1.5 justify-center py-2 text-xs">
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="android" className="space-y-4 pt-1">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Open this website in <strong className="text-foreground">Google Chrome</strong>.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-muted-foreground text-xs leading-relaxed font-normal">
                    Tap the menu icon <strong className="text-foreground inline-flex items-center gap-0.5 font-semibold">
                      <MoreVertical className="w-3.5 h-3.5 inline" /> (three dots)
                    </strong> in the browser's top-right corner.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">3</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Tap <strong className="text-foreground">Add to Home screen</strong> or <strong className="text-foreground">Install App</strong> to add it to your device.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ios" className="space-y-4 pt-1">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Open this website in <strong className="text-foreground">Safari</strong> on your iPhone/iPad.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Tap the <strong className="text-foreground inline-flex items-center gap-1 font-semibold">
                      Share <Share className="w-3.5 h-3.5 text-sky-400 inline" />
                    </strong> button at the bottom of the screen.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">3</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Scroll down and tap <strong className="text-foreground inline-flex items-center gap-1 font-semibold">
                      Add to Home Screen <Plus className="w-3.5 h-3.5 border border-border rounded p-0.5 inline" />
                    </strong>.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="desktop" className="space-y-4 pt-1">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Look at the right side of the address bar for the install icon (a small monitor icon with an arrow).
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Alternatively, click the menu button <strong className="text-foreground"><MoreVertical className="w-3.5 h-3.5 inline" /></strong> and select <strong className="text-foreground">Save and share &gt; Install page</strong>.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
