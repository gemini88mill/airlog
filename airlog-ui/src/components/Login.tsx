import { auth } from "../lib/auth";
import { LoginForm } from "./organisms/LoginForm";
import { Card } from "./organisms/Card";

export const Login = () => {
  const handleLogin = async (email: string, password: string) => {
    await auth.login(email, password);
    // Trigger page reload to refresh auth state
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-black">
      <Card title="Airlog Login">
        <LoginForm onSubmit={handleLogin} />
      </Card>
    </div>
  );
};
