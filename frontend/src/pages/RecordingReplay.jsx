import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import { chunksToBlobUrl } from "../utils/recordingPlayback";

const RecordingReplay = () => {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    API.get("/recordings")
      .then(({ data }) => setList(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const loadRecording = async (id) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setSelected(id);
    setVideoUrl(null);
    const { data } = await API.get(`/recordings/${id}`);
    const url = chunksToBlobUrl(data.chunks, data.mimeType);
    if (url) {
      urlRef.current = url;
      setVideoUrl(url);
    }
  };

  return (
    <AppLayout title="Recordings">
      <PageHeader
        title="Screen recording replay"
        subtitle="Review exam screen evidence"
      />

        {loading ? (
          <p>Loading recordings…</p>
        ) : list.length === 0 ? (
          <p className="text-slate-500">No recordings stored yet.</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-3 lg:col-span-1 max-h-[70vh] overflow-y-auto">
              {list.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => loadRecording(r._id)}
                  className={`w-full text-left rounded-xl border p-4 transition ${
                    selected === r._id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-500"
                  }`}
                >
                  <p className="font-medium">
                    {r.studentId?.name || "Student"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {r.examId?.title || "Exam"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>

            <GlassCard className="lg:col-span-2">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full rounded-xl bg-black max-h-[60vh]"
                  />
                  <p className="mt-4 text-sm text-slate-400">
                    Playback may vary by browser; WebM is recommended.
                  </p>
                </>
              ) : (
                <p className="text-slate-500 py-20 text-center">
                  Select a recording to replay
                </p>
              )}
            </GlassCard>
          </div>
        )}
    </AppLayout>
  );
};

export default RecordingReplay;
