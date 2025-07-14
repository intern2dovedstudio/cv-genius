"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import AuthPopUp from "@/components/ui/AuthPopUp";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { useCVForm } from "@/lib/hooks/useCVForm";
import FileUploadSection from "@/components/dashboard/FileUploadSection";
import CVFormSections from "@/components/dashboard/CVFormSections";

export default function DashboardPage() {
  // File upload functionality
  const {
    uploadedFile,
    isDragOver,
    errorFile,
    setIsDragOver,
    handleDrop,
    handleFileInput,
    removeFile,
    setFileError,
    showToastFile,
    setShowToastFile,
    parsedData,
    setParsedData,
  } = useFileUpload();

  // CV form functionality
  const {
    formData,
    isSubmitting,
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addLanguage,
    updateLanguage,
    removeLanguage,
    handleSubmit,
    showToastForm,
    setShowToastForm,
    errorForm,
    showCard,
    setShowCard,
    loadParsedData,
  } = useCVForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(uploadedFile, setFileError);
  };

  // Add useEffect to auto-fill when parsedData changes
  useEffect(() => {
    if (parsedData) {
      loadParsedData(parsedData);
    }
  }, [parsedData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Améliorer votre CV avec l'IA
              </h1>
              <p className="text-gray-600">
                Téléchargez votre CV et complétez les informations pour
                l'améliorer avec l'intelligence artificielle.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              {/* File Upload Section */}
              <FileUploadSection
                uploadedFile={uploadedFile}
                isDragOver={isDragOver}
                errors={errorFile}
                setIsDragOver={setIsDragOver}
                handleDrop={handleDrop}
                handleFileInput={handleFileInput}
                removeFile={removeFile}
              />

              {/* CV Form Sections */}
              <CVFormSections
                formData={formData}
                updatePersonalInfo={updatePersonalInfo}
                addExperience={addExperience}
                updateExperience={updateExperience}
                removeExperience={removeExperience}
                addEducation={addEducation}
                updateEducation={updateEducation}
                removeEducation={removeEducation}
                addSkill={addSkill}
                updateSkill={updateSkill}
                removeSkill={removeSkill}
                addLanguage={addLanguage}
                updateLanguage={updateLanguage}
                removeLanguage={removeLanguage}
              />

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  disabled={!uploadedFile}
                  className="w-full"
                >
                  {isSubmitting
                    ? "Amélioration en cours..."
                    : "Améliorer mon CV avec l'IA"}
                </Button>
                {!uploadedFile && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Veuillez d'abord télécharger un fichier CV
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast for error messages */}
      {showToastForm && errorForm && (
        <Toast
          message={errorForm}
          type="error"
          onClose={() => setShowToastForm(false)}
        />
      )}

      {showToastFile && errorFile && (
        <Toast
          message={errorFile}
          type="error"
          onClose={() => setShowToastFile(false)}
        />
      )}

      {/* Authentication popup */}
      <AuthPopUp isOpen={showCard} onClose={() => setShowCard(false)} />
    </div>
  );
}
