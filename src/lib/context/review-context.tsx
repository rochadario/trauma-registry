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
  saveComment: (
    data: Omit<ReviewComment, "session_id" | "reviewer_name" | "id" | "created_at">
  ) => Promise<void>;
  getComment: (fieldName: string) => ReviewComment | undefined;
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
  // Persist session_id within the browser tab so page navigations don't reset the count
  const sessionId = useRef<string>(
    typeof window !== "undefined"
      ? (sessionStorage.getItem("review_session_id") ?? (() => {
          const id = `review_${Date.now()}`;
          sessionStorage.setItem("review_session_id", id);
          return id;
        })())
      : `review_${Date.now()}`
  ).current;

  const [comments, setComments] = useState<ReviewComment[]>([]);

  // Load existing comments from Supabase on mount
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("field_reviews")
      .select("*")
      .eq("session_id", sessionId)
      .then(({ data }) => {
        if (data && data.length > 0) setComments(data as ReviewComment[]);
      });
  }, [sessionId]);

  const saveComment = useCallback(
    async (
      data: Omit<ReviewComment, "session_id" | "reviewer_name" | "id" | "created_at">
    ) => {
      const comment: ReviewComment = {
        ...data,
        session_id: sessionId,
        reviewer_name: reviewerName,
      };

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

  const getComment = useCallback(
    (fieldName: string) => comments.find((c) => c.field_name === fieldName),
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
        saveComment,
        getComment,
        deleteComment,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}
