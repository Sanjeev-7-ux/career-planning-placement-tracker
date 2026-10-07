import api from "../api";

export default async function downloadApplicationResume(application) {
  const response = await api.get(`/applications/${application.id}/resume`, {
    responseType: "blob",
  });
  const blobUrl = URL.createObjectURL(response.data);

  try {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = application.studentProfile.resumeFileName || "resume";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
