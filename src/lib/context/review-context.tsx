"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type ReviewAction = "modify" | "remove" | "add_option" | "keep";

export interface ReviewComment {
  id?: string;
  session_id: string;
  reviewer_name: string;
  step_id: string;
  step_label: string;
  field_name: string;
  field_label: string;
  action: ReviewAction;
  comment: string;
  created_at?: string;
}

interface ReviewContextValue {
  isReviewMode: true;
  reviewerName: string;
  sessionId: string;
  comments: ReviewComment[];
  totalCount: number;
  saveComment: (
    data: Omit<ReviewComment, "session_id" | "reviewer_name" | "id" | "created_at">
  ) => Promise<void>;
  getComment: (fieldName: string) => ReviewComment | undefined;
  hasAnyComment: (fieldName: string) => boolean;
  deleteComment: (fieldName: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function useReview(): ReviewContextValue | null {
  return useContext(ReviewContext);
}

export function ReviewProvider({
  children,
  reviewerName,
}: {
  children: ReactNode;
  reviewerName: string;
}) {
  // Stable session_id per tab (survives navigation within the tab)
  const sessionId = useRef<string>(
    typeof window !== "undefined"
      ? (sessionStorage.getItem("review_session_id") ?? (() => {
          const id = `review_${Date.now()}`;
          sessionStorage.setItem("review_session_id", id);
          return id;
        })())
      : `review_${Date.now()}`
  ).current;

  // All comments for this version (all sessions, all users with same reviewer_name)
  const [comments, setComments] = useState<ReviewComment[]>([]);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("field_reviews")
      .select("*")
      .eq("reviewer_name", reviewerName)
      .order("created_at", { ascending: false });

    if (data) setComments(data as ReviewComment[]);
  }, [reviewerName]);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime subscription — any insert/update/delete on field_reviews
  // refreshes the full list so all users stay in sync
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("field_reviews_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "field_reviews" },
        () => { fetchAll(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const saveComment = useCallback(
    async (
      data: Omit<ReviewComment, "session_id" | "reviewer_name" | "id" | "created_at">
    ) => {
      const comment: ReviewComment = {
        ...data,
        session_id: sessionId,
        reviewer_name: reviewerName,
      };

      // Optimistic update
      setComments((prev) => {
        const idx = prev.findIndex((c) => c.field_name === data.field_name);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = comment;
          return updated;
        }
        return [...prev, comment];
      });

      const supabase = createClient();
      await supabase.from("field_reviews").upsert(comment, {
        onConflict: "session_id,field_name",
      });
    },
    [sessionId, reviewerName]
  );

  // Returns only the current user's own comment (for editing in the popover)
  const getComment = useCallback(
    (fieldName: string) =>
      comments.find((c) => c.field_name === fieldName && c.session_id === sessionId),
    [comments, sessionId]
  );

  // True if ANY user has commented this field (for coloring the icon)
  const hasAnyComment = useCallback(
    (fieldName: string) => comments.some((c) => c.field_name === fieldName),
    [comments]
  );

  const deleteComment = useCallback(
    async (fieldName: string) => {
      setComments((prev) => prev.filter((c) => c.field_name !== fieldName));
      const supabase = createClient();
      await supabase
        .from("field_reviews")
        .delete()
        .eq("session_id", sessionId)
        .eq("field_name", fieldName);
    },
    [sessionId]
  );

  return (
    <ReviewContext.Provider
      value={{
        isReviewMode: true,
        reviewerName,
        sessionId,
        comments,
        totalCount: comments.length,
        saveComment,
        getComment,
        hasAnyComment,
        deleteComment,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}
