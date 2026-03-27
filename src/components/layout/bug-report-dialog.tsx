"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Flag, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BugReportDialogProps {
  userEmail?: string;
}

export function BugReportDialog({ userEmail }: BugReportDialogProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) setScreenshot(file);
  }

  function handleClose() {
    setOpen(false);
    setDescription("");
    setScreenshot(null);
    setSent(false);
  }

  async function handleSubmit() {
    if (!description.trim()) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append("description", description);
      form.append("page", pathname);
      if (userEmail) form.append("userEmail", userEmail);
      if (screenshot) form.append("screenshot", screenshot);

      const res = await fetch("/api/bug-report", { method: "POST", body: form });
      if (res.ok) {
        setSent(true);
        setTimeout(() => handleClose(), 2000);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        title={t("reportBug")}
        onClick={() => setOpen(true)}
      >
        <Flag className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("reportBug")}</DialogTitle>
          </DialogHeader>
          {sent ? (
            <p className="text-sm text-green-600 py-4 text-center">
              {t("bugReportSent")}
            </p>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{t("bugReportDescription")}</Label>
                  <Textarea
                    rows={5}
                    placeholder={t("bugReportPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t("screenshotLabel")}
                  </Label>
                  {screenshot ? (
                    <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{screenshot.name}</span>
                      <button
                        onClick={() => { setScreenshot(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed rounded-md px-3 py-2 w-full hover:border-primary hover:text-primary transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                      {t("attachScreenshot")}
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={sending || !description.trim()}>
                  {sending ? t("sending") : t("send")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
