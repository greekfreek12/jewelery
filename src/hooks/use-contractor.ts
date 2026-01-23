"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contractor } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export function useContractor() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadContractor() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("contractors")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setContractor(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadContractor();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setContractor(null);
        } else if (session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from("contractors")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setContractor(data);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { contractor, user, loading, error };
}
