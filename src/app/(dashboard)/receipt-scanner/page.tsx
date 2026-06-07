'use client';

import { useState, useCallback } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { ScannedReceipt } from '@/types';
import { getCurrentDateString } from '@/lib/formatters';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, CheckCircle, Loader2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_RECEIPTS: Omit<ScannedReceipt, 'rawText'>[] = [
  { merchant: 'KFC Malaysia', date: getCurrentDateString(), amount: 23.50, tax: 1.41, category: 'Food & Drinks' },
  { merchant: 'Grab Ride', date: getCurrentDateString(), amount: 12.00, category: 'Transport' },
  { merchant: 'Watsons', date: getCurrentDateString(), amount: 45.80, category: 'Healthcare' },
  { merchant: 'Uniqlo', date: getCurrentDateString(), amount: 89.90, category: 'Shopping' },
  { merchant: 'Tesco', date: getCurrentDateString(), amount: 67.30, tax: 4.00, category: 'Groceries' },
];

export default function ReceiptScannerPage() {
  const { createTransaction } = useTransactions();
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState<ScannedReceipt | null>(null);
  const [savedReceipts, setSavedReceipts] = useState<ScannedReceipt[]>([]);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const simulateScan = useCallback(() => {
    setIsScanning(true);
    setScanned(null);
    setTimeout(() => {
      const mock = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)];
      setScanned(mock);
      setEditAmount(mock.amount.toString());
      setEditCategory(mock.category);
      setIsScanning(false);
      toast.success('Receipt scanned successfully!');
    }, 2000);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) simulateScan();
    else toast.error('Please upload an image file');
  }, [simulateScan]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) simulateScan();
  }, [simulateScan]);

  const handleSaveTransaction = () => {
    if (!scanned) return;
    createTransaction({
      type: 'expense',
      amount: parseFloat(editAmount) || scanned.amount,
      category: editCategory || scanned.category,
      description: `${scanned.merchant} (receipt)`,
      date: scanned.date,
    });
    setSavedReceipts(prev => [...prev, { ...scanned, amount: parseFloat(editAmount) || scanned.amount, category: editCategory }]);
    setScanned(null);
    toast.success('Transaction saved from receipt!');
  };

  const EXPENSE_CATEGORIES = [
    'Food & Drinks', 'Groceries', 'Transport', 'Healthcare', 'Shopping',
    'Entertainment', 'Utilities', 'Dining Out', 'Education',
  ];

  return (
    <div className="space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" /> Receipt Scanner
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Upload receipts to automatically create transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload zone */}
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              {isScanning ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Scanning receipt...</p>
                  <p className="text-xs text-muted-foreground">Extracting merchant, amount & category</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293 / 20%), oklch(0.65 0.2 220 / 10%))' }}>
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Drop receipt image here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, HEIC</p>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    <span className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, oklch(0.58 0.22 293), oklch(0.65 0.2 220))' }}>
                      Browse Files
                    </span>
                  </label>
                  <Button variant="outline" size="sm" onClick={simulateScan} className="mt-1">
                    Try Demo Scan
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scanned result */}
        <div>
          {scanned ? (
            <div className="glass-card rounded-2xl border border-emerald-500/30 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold">Receipt Scanned</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Merchant</p>
                  <p className="font-semibold">{scanned.merchant}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="font-semibold">{scanned.date}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (RM)</Label>
                  <Input type="number" step="0.01" value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="bg-muted/50" />
                </div>
                {scanned.tax && (
                  <div>
                    <p className="text-xs text-muted-foreground">Tax: {formatCurrency(scanned.tax)}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={editCategory} onValueChange={(v) => setEditCategory(v ?? '')}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScanned(null)} className="flex-1">
                  Discard
                </Button>
                <Button onClick={handleSaveTransaction} className="flex-1 text-white"
                  style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.65 0.18 175))' }}>
                  Save Transaction
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-border p-8 text-center h-full flex flex-col items-center justify-center gap-3">
              <Receipt className="w-12 h-12 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No receipt scanned yet</p>
              <p className="text-xs text-muted-foreground">Upload a receipt to see the extracted data here</p>
            </div>
          )}
        </div>
      </div>

      {/* Scan history */}
      {savedReceipts.length > 0 && (
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Scan History</h3>
          </div>
          <div className="divide-y divide-border">
            {savedReceipts.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.merchant}</p>
                  <p className="text-xs text-muted-foreground">{r.category} · {r.date}</p>
                </div>
                <p className="text-expense font-bold text-sm">-{formatCurrency(r.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
