import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { sessionActions, useSessionStore } from "../store/session";
import { pingServer } from "../api/auth";
import { Sparkles, Wifi } from "lucide-react";

const DEFAULT_SERVER = "http://localhost:4000";

function ConnectPage() {
  const navigate = useNavigate();
  const existingServerUrl = useSessionStore((state) => state.serverUrl);
  const accessToken = useSessionStore((state) => state.accessToken);
  const [serverUrl, setServerUrl] = useState(existingServerUrl ?? DEFAULT_SERVER);

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      await pingServer(url);
      sessionActions.setServerUrl(url);
    },
    onSuccess: () => {
      navigate(accessToken ? "/app" : "/auth", { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accentMuted/10 blur-3xl" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="glass-panel max-w-xl w-full rounded-3xl p-10 shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 text-accent mb-6">
            <Sparkles className="h-6 w-6" />
            <span className="uppercase tracking-[.35em] text-sm font-semibold text-accentSoft">
              Fuse Connect
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Подключитесь к вашему Fuse-серверу
          </h1>
          <p className="text-muted mb-8 leading-relaxed">
            Введите IP-адрес или DNS-имя развёрнутого сервера Fuse. Мы проверим соединение и подготовим
            клиента к работе. Для локальных сетей используйте, например, <span className="text-accent">http://192.168.0.10:4000</span>.
          </p>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!serverUrl.trim()) {
                return;
              }
              mutation.mutate(serverUrl.trim());
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted uppercase tracking-widest">
                Адрес сервера
              </span>
              <div className="flex h-14 items-center gap-3 rounded-xl bg-surfaceElevated px-5 border border-white/10 focus-within:border-accent transition">
                <Wifi className="h-5 w-5 text-accent" />
                <input
                  className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted focus:outline-none"
                  placeholder="http://example.com:4000"
                  value={serverUrl}
                  onChange={(event) => setServerUrl(event.target.value)}
                />
              </div>
            </label>

            {mutation.isError ? (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                Не удалось подключиться к серверу. Проверьте адрес и сетевое соединение.
              </div>
            ) : null}

            <button
              type="submit"
              className="accent-ring group flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-background transition hover:bg-accentMuted disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Подключаемся..." : "Подключить сервер"}
            </button>
          </form>

          {existingServerUrl && (
            <div className="mt-6 text-xs text-muted">
              Текущий сервер: <span className="text-accent">{existingServerUrl}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectPage;
