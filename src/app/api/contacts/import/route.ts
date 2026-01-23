import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/analytics/events";

interface ImportedContact {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  notes?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Parse CSV content into contact objects
 */
function parseCSV(content: string): { contacts: ImportedContact[]; errors: string[] } {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return { contacts: [], errors: ["CSV must have a header row and at least one data row"] };
  }

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const headers = parseCSVLine(headerLine);

  // Find column indices
  const nameIdx = headers.findIndex((h) =>
    h.includes("name") || h.includes("full name") || h.includes("customer")
  );
  const phoneIdx = headers.findIndex((h) =>
    h.includes("phone") || h.includes("mobile") || h.includes("cell") || h.includes("number")
  );
  const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("e-mail"));
  const tagsIdx = headers.findIndex((h) => h.includes("tag") || h.includes("label") || h.includes("category"));
  const notesIdx = headers.findIndex((h) => h.includes("note") || h.includes("comment") || h.includes("description"));

  if (nameIdx === -1) {
    return { contacts: [], errors: ["Could not find a name column. Include a column with 'name' in the header."] };
  }
  if (phoneIdx === -1) {
    return { contacts: [], errors: ["Could not find a phone column. Include a column with 'phone' in the header."] };
  }

  const contacts: ImportedContact[] = [];
  const errors: string[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const name = values[nameIdx]?.trim();
    const phone = normalizePhone(values[phoneIdx] || "");

    if (!name) {
      errors.push(`Row ${i + 1}: Missing name`);
      continue;
    }
    if (!phone) {
      errors.push(`Row ${i + 1}: Missing or invalid phone number`);
      continue;
    }

    const contact: ImportedContact = { name, phone };

    if (emailIdx !== -1 && values[emailIdx]) {
      const email = values[emailIdx].trim();
      if (isValidEmail(email)) {
        contact.email = email;
      }
    }

    if (tagsIdx !== -1 && values[tagsIdx]) {
      contact.tags = values[tagsIdx]
        .split(/[,;|]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    if (notesIdx !== -1 && values[notesIdx]) {
      contact.notes = values[notesIdx].trim();
    }

    contacts.push(contact);
  }

  return { contacts, errors };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const skipDuplicates = formData.get("skipDuplicates") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file content
    const content = await file.text();
    const { contacts, errors } = parseCSV(content);

    if (contacts.length === 0 && errors.length > 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        skipped: 0,
        errors
      });
    }

    // Get existing phone numbers to check for duplicates
    const { data: existingContacts } = await supabase
      .from("contacts")
      .select("phone")
      .eq("contractor_id", user.id);

    const existingPhones = new Set(
      (existingContacts || []).map((c: { phone: string }) => c.phone)
    );

    // Filter and prepare contacts for insertion
    let skipped = 0;
    const toInsert: {
      contractor_id: string;
      name: string;
      phone: string;
      email: string | null;
      tags: string[];
      notes: string | null;
      source: string;
    }[] = [];

    for (const contact of contacts) {
      if (existingPhones.has(contact.phone)) {
        if (skipDuplicates) {
          skipped++;
          continue;
        }
      }

      toInsert.push({
        contractor_id: user.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || null,
        tags: contact.tags || [],
        notes: contact.notes || null,
        source: "import",
      });
    }

    // Batch insert
    if (toInsert.length > 0) {
      const contactsTable = supabase.from("contacts");
      // @ts-expect-error - Supabase types not generated for contacts table
      const { error: insertError } = await contactsTable.insert(toInsert);

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to import contacts", details: insertError.message },
          { status: 500 }
        );
      }
    }

    // Log analytics event
    await logEvent({
      contractorId: user.id,
      eventType: "contact_imported",
      metadata: { count: toInsert.length, skipped },
    });

    const result: ImportResult = {
      success: true,
      imported: toInsert.length,
      skipped,
      errors,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to process import" },
      { status: 500 }
    );
  }
}
