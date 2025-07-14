
import { NextRequest, NextResponse } from "next/server";
import { MAX_FILE_SIZE } from "@/lib/hooks/useFileUpload";
import pdfParse from "pdf-parse";
import { parseCVText } from "@/lib/utils/parseCVregex";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";   
export async function POST(req: NextRequest) {
  try {
    console.log("PDF Parsing API - Request received");

/*   I commented this part out to make sure the problem not come from check user authentication
  // Create a server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      console.log("PDF Parsing Error - No authorization header");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract the token from the Bearer token
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
 
    if (!user || authError) {
      console.log("PDF Parsing Error - Authentication failed:", { user, authError });
    }
    console.log("PDF Parsing API - Authentication successful for user:", user!.id);

    // Get the uploaded PDF from request */
    let formdata;
    try {
      formdata = await req.formData();
    } catch (formError) {
      console.log("PDF Parsing Error - Failed to parse form data:", formError);
      return NextResponse.json(
        { success: false, error: "Données de formulaire invalides" },
        { status: 400 }
      );
    }

    const file = formdata.get("file") as File;

    if (!file) {
      console.log("PDF Parsing Error - No file provided in request");
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    console.log("PDF Parsing API - File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Validate the PDF file
    if (file.type !== "application/pdf") {
      console.log("PDF Parsing Error - Invalid file type:", file.type);
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      console.log("PDF Parsing Error - File too large:", {
        fileSize: file.size,
        maxSize: MAX_FILE_SIZE,
      });
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    console.log("PDF Parsing API - Starting PDF processing");

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("PDF Parsing API - Buffer created, size:", buffer.length);

    // Parse PDF
    const data = await pdfParse(buffer);

    console.log(
      "PDF Parsing API - PDF parsed successfully, pages:",
      data.numpages
    );

    const extractedText = data.text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();

    console.log(
      "PDF Parsing API - Text extracted, length:",
      extractedText.length
    );
    console.log(
      "PDF Parsing API - First 200 chars of extracted text:",
      extractedText.substring(0, 200)
    );

    // Use regex to extract the data in type CVDataForm:
    const cvData = parseCVText(extractedText);

    console.log("PDF Parsing API - CV data parsed successfully:", {
      personalInfo: cvData.personalInfo,
      experiencesCount: cvData.experiences.length,
      educationCount: cvData.education.length,
      skillsCount: cvData.skills.length,
      languagesCount: cvData.languages?.length || 0,
    });

    return NextResponse.json(
      {
        success: true,
        parsedData: cvData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PDF parsing error - Main catch block:", err);
    console.log("PDF Parsing Error - Full error details:", {
      name: err instanceof Error ? err.name : "Unknown error type",
      message: err instanceof Error ? err.message : "Unknown error message",
      stack: err instanceof Error ? err.stack : "No stack trace available",
    });

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to parse PDF. Please ensure the file is a valid PDF document.",
      },
      { status: 500 }
    );
  }
}
