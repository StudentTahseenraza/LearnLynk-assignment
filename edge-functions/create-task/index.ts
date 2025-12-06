import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Define request schema
const CreateTaskSchema = z.object({
  application_id: z.string().uuid("Invalid application ID format"),
  task_type: z.enum(["call", "email", "review"], {
    errorMap: () => ({ message: "Task type must be one of: call, email, review" }),
  }),
  due_at: z.string().datetime({ offset: true }),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate HTTP method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse and validate request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate against schema
    const validationResult = CreateTaskSchema.safeParse(requestData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { application_id, task_type, due_at, title, description, assigned_to, priority } =
      validationResult.data;

    // Validate due_at is in the future
    const dueDate = new Date(due_at);
    const now = new Date();
    if (dueDate <= now) {
      return new Response(
        JSON.stringify({ error: "due_at must be in the future" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase admin client (service role for bypassing RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Also create a client with user token for validation
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      },
    );

    // Verify the application exists and user has access
    const { data: application, error: appError } = await supabaseUser
      .from("applications")
      .select("id, tenant_id, lead_id")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: "Application not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create the task using admin client (bypasses RLS)
    const taskTitle = title || `${task_type.charAt(0).toUpperCase() + task_type.slice(1)} Task`;

    const { data: task, error: insertError } = await supabaseAdmin
      .from("tasks")
      .insert({
        tenant_id: application.tenant_id,
        related_id: application_id,
        type: task_type,
        title: taskTitle,
        description: description,
        due_at: due_at,
        status: "pending",
        priority: priority,
        assigned_to: assigned_to,
      })
      .select(`
        id,
        title,
        type,
        due_at,
        status,
        priority,
        related_id,
        applications:related_id (
          id,
          lead_id,
          leads:lead_id (
            id,
            first_name,
            last_name
          )
        )
      `)
      .single();

    if (insertError) {
      console.error("Task insertion error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create task", details: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Emit realtime event
    const eventPayload = {
      event: "task.created",
      payload: task,
      type: "broadcast",
    };

    await supabaseAdmin.channel("tasks").send(eventPayload);

    // Also send to specific tenant channel
    await supabaseAdmin.channel(`tenant:${application.tenant_id}`).send({
      type: "broadcast",
      event: "task.created",
      payload: task,
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.id,
        task: {
          id: task.id,
          title: task.title,
          type: task.type,
          due_at: task.due_at,
          status: task.status,
          priority: task.priority,
          application_id: task.related_id,
        },
        message: "Task created successfully",
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});