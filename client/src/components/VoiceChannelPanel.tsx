import { useEffect, useRef } from "react";
import { MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { useVoiceCall } from "../hooks/useVoiceCall";

interface VoiceChannelPanelProps {
  channelId?: string;
  enabled?: boolean;
}

function ParticipantTile({
  name,
  stream,
  isLocal,
}: {
  name: string;
  stream?: MediaStream;
  isLocal?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && stream && !isLocal) {
      audioRef.current.srcObject = stream;
    }
    if (audioRef.current && isLocal) {
      audioRef.current.muted = true;
    }
  }, [stream, isLocal]);

  return (
    <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-surface p-4 text-sm text-foreground shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-xl font-semibold text-accent">
        {name[0]?.toUpperCase()}
      </div>
      <span className="max-w-[8rem] truncate text-center text-xs text-muted">{name}</span>
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}

export function VoiceChannelPanel({ channelId, enabled }: VoiceChannelPanelProps) {
  const { isJoining, isInCall, isMuted, error, participants, joinCall, leaveCall, endCall, toggleMute } =
    useVoiceCall({ channelId, enabled });

  return (
    <div className="flex h-full flex-col bg-surfaceElevated/60 backdrop-blur border-l border-white/5">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-foreground">Голосовой канал</h3>
        <p className="text-xs text-muted mt-1">
          Подключитесь к голосу, чтобы общаться с командой в реальном времени.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {participants.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {participants.map((participant) => (
              <ParticipantTile
                key={participant.id}
                name={participant.user?.displayName ?? participant.user?.username ?? "Гость"}
                stream={participant.stream}
                isLocal={participant.id === "local"}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-xs text-muted">
            Никто ещё не в голосе
          </div>
        )}
      </div>
      {error ? (
        <div className="border-t border-danger/30 bg-danger/10 px-6 py-3 text-xs text-danger">{error}</div>
      ) : null}
      <div className="border-t border-white/5 px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isInCall ? toggleMute : joinCall}
            className={`accent-ring flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              isInCall
                ? isMuted
                  ? "bg-danger/20 text-danger hover:bg-danger/30"
                  : "bg-accent text-background hover:bg-accentMuted"
                : "bg-accent text-background hover:bg-accentMuted"
            }`}
            disabled={isJoining || !enabled}
          >
            {isInCall ? (
              isMuted ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Включить микрофон
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Выключить микрофон
                </>
              )
            ) : (
              <>
                <Phone className="h-4 w-4" />
                {isJoining ? "Подключаем..." : "Подключиться"}
              </>
            )}
          </button>
          {isInCall ? (
            <button
              type="button"
              onClick={leaveCall}
              className="accent-ring flex h-12 w-12 items-center justify-center rounded-xl bg-danger/80 text-background transition hover:bg-danger"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        {isInCall ? (
          <button
            type="button"
            onClick={endCall}
            className="mt-3 w-full rounded-xl border border-danger/40 bg-danger/10 py-2 text-xs text-danger transition hover:bg-danger/20"
          >
            Завершить звонок для всех
          </button>
        ) : null}
      </div>
    </div>
  );
}
