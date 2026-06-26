import { useState, useEffect } from "react";
import api from "../api/client";

export function useVoteStatus() {
  const [status, setStatus] = useState<"open" | "closed" | "not_started">("closed");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("/api/vote/status")
      .then((res) => {
        setStatus(res.data.channel_status);
        setMessage(res.data.custom_message || "");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { status, message, loading, isError: error };
}
