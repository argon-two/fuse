import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Flame, LogIn, UserPlus } from "lucide-react";
import { loginUser, registerUser } from "../api/auth";
import { sessionActions, useSessionStore } from "../store/session";

const loginSchema = z.object({
  identifier: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(8, "Минимум 8 символов"),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    email: z.string().email("Некорректный email"),
    username: z
      .string()
      .min(3, "Минимум 3 символа")
      .regex(/^[a-zA-Z0-9_\-]+$/, "Допустимы латинские буквы, цифры, _ и -"),
    password: z
      .string()
      .min(8, "Минимум 8 символов")
      .regex(/[A-Z]/, "Добавьте заглавную букву")
      .regex(/[0-9]/, "Добавьте цифру"),
    displayName: z.string().min(2, "Минимум 2 символа").max(100).optional(),
  })
  .refine((data) => data.username.toLowerCase() !== "admin", {
    message: "Имя пользователя admin зарезервировано",
    path: ["username"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function AuthPage() {
  const navigate = useNavigate();
  const serverUrl = useSessionStore((state) => state.serverUrl);
  const [mode, setMode] = useState<"login" | "register">("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      displayName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      sessionActions.setAuthSession(data);
      navigate("/app", { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      sessionActions.setAuthSession(data);
      navigate("/app", { replace: true });
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,201,72,0.15),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(229,170,23,0.1),transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="glass-panel w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          <div className="grid md:grid-cols-2">
            <div className="relative hidden bg-gradient-to-br from-surfaceElevated via-surface to-surface/60 p-10 md:flex md:flex-col">
              <div className="flex items-center gap-3 text-accent">
                <Flame className="h-6 w-6" />
                <span className="text-sm font-semibold uppercase tracking-[.4em]">Fuse</span>
              </div>
              <h2 className="mt-8 text-3xl font-bold text-foreground">Единый командный центр</h2>
              <p className="mt-4 text-muted leading-relaxed">
                Общайтесь в защищённых текстовых каналах, подключайтесь к голосовым комнатам c
                низкой задержкой, делитесь файлами и музыкой. Всё в едином интерфейсе, созданном для
                игровых команд и киберспортивных сообществ.
              </p>
              {serverUrl ? (
                <div className="mt-auto rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm text-accentSoft">
                  Подключён сервер: <span className="font-semibold">{serverUrl}</span>
                </div>
              ) : null}
            </div>
            <div className="p-10">
              <div className="mb-8 flex rounded-full border border-white/5 bg-surfaceElevated p-1 text-sm font-medium text-muted">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-full px-6 py-2 transition ${
                    mode === "login" ? "bg-accent text-background shadow-glow" : ""
                  }`}
                >
                  Войти
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-full px-6 py-2 transition ${
                    mode === "register" ? "bg-accent text-background shadow-glow" : ""
                  }`}
                >
                  Создать аккаунт
                </button>
              </div>

              {mode === "login" ? (
                <form
                  className="space-y-5"
                  onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Email или логин</label>
                    <input
                      {...loginForm.register("identifier")}
                      className="w-full rounded-xl bg-surfaceElevated px-4 py-3 text-foreground placeholder:text-muted border border-white/10 focus:border-accent focus:outline-none"
                      placeholder="player.one"
                    />
                    {loginForm.formState.errors.identifier ? (
                      <p className="text-xs text-danger">
                        {loginForm.formState.errors.identifier.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Пароль</label>
                    <input
                      {...loginForm.register("password")}
                      type="password"
                      className="w-full rounded-xl bg-surfaceElevated px-4 py-3 text-foreground placeholder:text-muted border border-white/10 focus:border-accent focus:outline-none"
                      placeholder="********"
                    />
                    {loginForm.formState.errors.password ? (
                      <p className="text-xs text-danger">
                        {loginForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  {loginMutation.isError ? (
                    <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                      Неверные учетные данные. Попробуйте ещё раз.
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="accent-ring flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-base font-semibold text-background transition hover:bg-accentMuted disabled:opacity-60"
                  >
                    <LogIn className="h-5 w-5" />
                    {loginMutation.isPending ? "Входим..." : "Войти"}
                  </button>
                </form>
              ) : (
                <form
                  className="space-y-5"
                  onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-muted">Email</span>
                      <input
                        {...registerForm.register("email")}
                        className="w-full rounded-xl bg-surfaceElevated px-4 py-3 text-foreground placeholder:text-muted border border-white/10 focus:border-accent focus:outline-none"
                        placeholder="captain@team.gg"
                      />
                      {registerForm.formState.errors.email ? (
                        <p className="text-xs text-danger">
                          {registerForm.formState.errors.email.message}
                        </p>
                      ) : null}
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-muted">Логин</span>
                      <input
                        {...registerForm.register("username")}
                        className="w-full rounded-xl bg-surfaceElevated px-4 py-3 text-foreground placeholder:text-muted border border-white/10 focus:border-accent focus:outline-none"
                        placeholder="captain"
                      />
                      {registerForm.formState.errors.username ? (
                        <p className="text-xs text-danger">
                          {registerForm.formState.errors.username.message}
                        </p>
                      ) : null}
                    </label>
                  </div>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-muted">Отображаемое имя</span>
                    <input
                      {...registerForm.register("displayName")}
                      className="w-full rounded-xl bg-surfaceElevated px-4 py-3 text-foreground placeholder:text-muted border border-white/10 focus:border-accent focus:outline-none"
                      placeholder="Captain Marvelous"
                    />
                    {registerForm.formState.errors.displayName ? (
                      <p className="text-xs text-danger">
                        {registerForm.formState.errors.displayName.message}
                      </p>
                    ) : null}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-muted">Пароль</span>
                    <input
                      {...registerForm.register("password")}
                      type="password"
                      className="w-full rounded-xl bg-surfaceElevated px-4 py-3 text-foreground placeholder:text-muted border border-white/10 focus:border-accent focus:outline-none"
                      placeholder="Надёжный пароль"
                    />
                    {registerForm.formState.errors.password ? (
                      <p className="text-xs text-danger">
                        {registerForm.formState.errors.password.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">Минимум 8 символов, заглавная буква и цифра.</p>
                    )}
                  </label>

                  {registerMutation.isError ? (
                    <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                      Не удалось создать аккаунт. Возможно, логин или email уже используются.
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="accent-ring flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-base font-semibold text-background transition hover:bg-accentMuted disabled:opacity-60"
                  >
                    <UserPlus className="h-5 w-5" />
                    {registerMutation.isPending ? "Создаём..." : "Создать аккаунт"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
