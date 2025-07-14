"use client";
import { CVFormData, PDFParseResponse } from "@/types";
import { useState } from "react";
import { supabase } from "../supabase/client";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileUploadState {
  uploadedFile: File | null;
  isDragOver: boolean;
  errorFile: string;
}

export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorFile, setErrorFile] = useState<string>("");
  const [parsedData, setParsedData] = useState<CVFormData | null>(null);
  const [showToastFile, setShowToastFile] = useState<boolean>(false);

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > MAX_FILE_SIZE) {
      return "Le fichier ne doit pas dépasser 10MB";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Seuls les fichiers PDF, TXT et DOC sont acceptés";
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      console.log("PDF Parsing Error - File validation failed:", error);
      setErrorFile(error);
      return;
    }

    setUploadedFile(file);
    if (file.type === "application/pdf") {
      const response = await parsePDFfile(file);
      if (response.error) {
        console.log("PDF Parsing Error - handleFileSelect:", response.error);
        setShowToastFile(true);
        setErrorFile(response.error);
      }
      if (response.success && response.parsedData) {
        console.log("PDF Parsing Success - Data received:", response.parsedData);
        setParsedData(response.parsedData);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    let file;
    if (files && files.length > 0) {
      file = files[0];
      handleFileSelect(file);
    }
  };

  const parsePDFfile = async (file: File): Promise<PDFParseResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      console.log("PDF Parsing - Starting API call for file:", file.name);
      
      // Get the auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error("Vous devez être connecté pour analyser un PDF");
      }
      
      const response = await fetch("/api/parser", {
        method: "POST",
        // headers: {
        //   'Authorization': `Bearer ${token}`,
        // },
        body: formData,
      });

      // Read the response body once as text
      const responseText = await response.text();
      console.log("PDF Parsing - Raw response:", responseText);

      // Check if the response is ok
      if (!response.ok) {
        console.log("PDF Parsing Error - HTTP response not ok:", {
          status: response.status,
          statusText: response.statusText
        });

        // Try to parse the error from the response text
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.log("PDF Parsing Error - Non-JSON response:", responseText);
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse the successful response
      let result: PDFParseResponse;
      try {
        result = JSON.parse(responseText);
        console.log("PDF Parsing - API response received:", result);
      } catch (jsonError) {
        console.error("PDF Parsing Error - Invalid JSON response:", jsonError);
        throw new Error("Le serveur a renvoyé une réponse invalide. Veuillez réessayer.");
      }

      return result;
    } catch (error) {
      console.error("PDF Service Error - parsePDFfile catch block:", error);
      console.log("PDF Parsing Error - Full error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
      } as PDFParseResponse;
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setErrorFile("");
  };

  const setFileError = (error: string) => {
    setErrorFile(error);
  };

  return {
    uploadedFile,
    isDragOver,
    errorFile,
    parsedData,
    setParsedData,
    showToastFile,
    setShowToastFile,
    setIsDragOver,
    handleDrop,
    handleFileInput,
    removeFile,
    setFileError,
  };
};
