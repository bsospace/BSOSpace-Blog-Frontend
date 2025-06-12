import { useState } from "react";
import { Upload, FileText, Send, Search, Book } from "lucide-react";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [asking, setAsking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://bobby.posyayee.com:8088/upload", {
        method: "POST",
        body: formData,
      });

      const data: { preview?: string } = await res.json();
      setExtractedText(data.preview || "No text extracted.");
      setActiveTab("chat"); // Auto switch to chat tab
    } catch (err) {
      console.error(err);
      setExtractedText("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async (): Promise<void> => {
    if (!question) return;

    setAsking(true);
    try {
      const res = await fetch("http://bobby.posyayee.com:8088/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data: { answer?: string } = await res.json();
      setAnswer(data.answer || "No answer.");
    } catch (err) {
      console.error(err);
      setAnswer("Ask failed.");
    } finally {
      setAsking(false);
      setQuestion(""); // Clear input after asking
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-indigo-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Book className="w-8 h-8" />
            <h1 className="text-2xl font-bold">RAG SearchBot</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${activeTab === "upload" ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${activeTab === "chat" ? "bg-indigo-700" : "hover:bg-indigo-700"}`}
            >
              <Search className="w-5 h-5 mr-2" />
              Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl flex-grow p-6">
        {activeTab === "upload" ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Upload PDF</h2>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-12 h-12 text-indigo-500 mb-2" />
                  <p className="text-lg text-gray-700 mb-1">
                    {file ? file.name : "Choose a PDF or drag & drop"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF files only"}
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`mt-4 w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-colors ${!file || uploading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Document
                </>
              )}
            </button>

            {extractedText && (
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Document Preview:</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">{extractedText}</pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Search className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Ask Questions About Your Document</h2>
            </div>

            <div className="flex mb-4">
              <input
                type="text"
                value={question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                placeholder="Type your question about the document..."
                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAsk()}
              />
              <button
                onClick={handleAsk}
                disabled={!question || asking}
                className={`p-3 rounded-r-lg flex items-center ${!question || asking ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
              >
                {asking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {answer && (
              <div className="mt-4">
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="font-medium text-indigo-800 mb-2">Answer:</h3>
                  <p className="text-gray-800">{answer}</p>
                </div>
              </div>
            )}

            {!answer && (
              <div className="mt-8 text-center p-8 border border-gray-200 rounded-lg bg-gray-50">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Ask a question about your uploaded document to get started</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-100 border-t border-gray-200 p-4 text-center text-gray-600 text-sm">
        RAG SearchBot &copy; {new Date().getFullYear()} | Document analysis and Q&A system
      </footer>
    </div>
  );
}