import { useState, useContext } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProjectContext } from "../context/ProjectContext";
import { projectChat } from "../api/chatApi";

export default function ChatPage() {
  const { project } = useContext(ProjectContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const res = await projectChat({
      projectId: project._id,
      question: input
    });

    setMessages([
      ...messages,
      { role: "user", content: input },
      { role: "ai", content: res.data.answer }
    ]);

    setInput("");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl ${
                m.role === "user"
                  ? "bg-cyan-600 ml-auto w-fit"
                  : "bg-slate-700 w-fit"
              }`}
            >
              {m.content}
            </div>
          ))}

        </div>

        <div className="flex gap-2 p-4">
          <input
            className="flex-1 p-3 rounded bg-slate-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="btn-glow px-6 py-2 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}