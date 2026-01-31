import { useState } from "react";
import { Button } from "../atoms/Button";
import { FormField } from "../molecules/FormField";
import { ErrorMessage } from "../atoms/ErrorMessage";

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
};

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormLoading = isLoading || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={isFormLoading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        disabled={isFormLoading}
      />

      {error && <ErrorMessage message={error} />}

      <Button
        type="submit"
        fullWidth
        loading={isFormLoading}
        disabled={isFormLoading}
      >
        {isFormLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};
