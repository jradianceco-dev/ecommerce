"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Type definition for the form state
export interface AuthState {
  error: string | null;
}

export async function signup(
  prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState | null> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: "customer", // All users starts as a customer
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect to a check-email page or home
  redirect("/");
}

export async function login(prevState: AuthState | null, formData: FormData): Promise<AuthState | null> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
