"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, X } from "lucide-react";
import { useReview, type ReviewAction } from "@/lib/context/review-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ACTION_COLORS_BG: Record<ReviewAction, string> = {
  modify:     "bg-blue-500 text-white border-blue-500",
  remove:     "bg-red-500 text-white border-red-500",
  add_option: "bg-purple-500 text-white border-purple-500",
  keep:       "bg-green-500 text-white border-green-500",
};

const ACTION_COLORS: Record<ReviewAction, string> = {
  modify:     "text-blue-500",
  remove:     "text-red-500",
  add_option: "text-purple-500",
  keep:       "text-green-500",
};

interface ReviewCommentButtonProps {
  fieldName: string;
  fieldLabel: string;
  stepId: string;
  stepLabel: string;
}

export function ReviewCommentButton({
  fieldName,
  fieldLabel,
  stepId,
  stepLabel,
}: ReviewCommentButtonProps) {
  const t = useTranslations("reviewComment");
  const review = useReview();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ReviewAction>("modify");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!review) return null;

  const ACTIONS: { value: ReviewAction; label: string; color: string }[] = [
    { value: "modify",     label: t("actionModify"),    color: ACTION_COLORS_BG.modify },
    { value: "remove",     label: t("actionRemove"),    color: ACTION_COLORS_BG.remove },
    { value: "add_option", label: t("actionAddOption"), color: ACTION_COLORS_BG.add_option },
    { value: "keep",       label: t("actionKeep"),      color: ACTION_COLORS_BG.keep },
  ];

  const PLACEHOLDERS: Record<ReviewAction, string> = {
    modify: t("placeholderModify"),
    remove: t("placeholderRemove"),
    add_option: t("placeholderAddOption"),
    keep: t("placeholderKeep"),
  };

  const existing = review.getComment(fieldName);       // current user's comment
  const anyComment = review.hasAnyComment(fieldName);  // any user's comment

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setAction(existing?.action ?? "modify");
      setText(existing?.comment === "—" ? "" : (existing?.comment ?? ""));
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    setSaving(true);
    await review.saveComment({
      step_id: stepId,
      step_label: stepLabel,
      field_name: fieldName,
      field_label: fieldLabel,
      action,
      comment: text.trim() || "—",
    });
    setSaving(false);
    setOpen(false);
  };

  const handleDelete = async () => {
    await review.deleteComment(fieldName);
    setOpen(false);
    setText("");
  };

  const hasOwnComment = !!existing;
  const actionColor = hasOwnComment ? ACTION_COLORS[existing.action] : "text-amber-500";

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`absolute top-0 right-0 z-10 p-1 rounded-full transition-colors ${actionColor} hover:opacity-80`}
          title={hasOwnComment ? existing.comment : anyComment ? t("viewOtherComment") : t("addComment")}
        >
          <MessageCircle
            className="h-4 w-4"
            fill={anyComment ? "currentColor" : "none"}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right" align="start">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {stepLabel}
            </p>
            <p className="font-semibold text-sm mt-0.5">{fieldLabel}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{fieldName}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{t("changeType")}</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {ACTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAction(a.value)}
                  className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                    action === a.value
                      ? a.color
                      : "border-input hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {t("comment")}
              {action === "keep" && (
                <span className="ml-1 text-muted-foreground">{t("optional")}</span>
              )}
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDERS[action]}
              className="text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? t("saving") : t("save")}
            </Button>
            {hasOwnComment && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive px-2"
                title={t("deleteComment")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
