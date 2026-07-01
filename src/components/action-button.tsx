import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ActionField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "number" | "email" | "tel" | "select";
  options?: { label: string; value: string }[];
  defaultValue?: string;
  required?: boolean;
};

export interface ActionButtonProps {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  primary?: boolean;
  className?: string;
  /** Dialog title. Defaults to label. */
  title?: string;
  description?: string;
  fields?: ActionField[];
  confirmLabel?: string;
  successMessage?: (values: Record<string, string>) => string;
  onConfirm?: (values: Record<string, string>) => void;
}

export function ActionButton({
  label,
  icon,
  variant = "outline",
  size = "sm",
  primary,
  className,
  title,
  description,
  fields = [],
  confirmLabel = "Confirm",
  successMessage,
  onConfirm,
}: ActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""])),
  );

  const submit = () => {
    for (const f of fields) {
      if (f.required !== false && !values[f.name]?.toString().trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    onConfirm?.(values);
    toast.success(successMessage ? successMessage(values) : `${title ?? label} completed`);
    setOpen(false);
  };

  const triggerStyle = primary
    ? { background: "var(--gradient-primary)" }
    : undefined;
  const triggerClass = primary
    ? `text-primary-foreground border-0 ${className ?? ""}`
    : className;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={primary ? "default" : variant} size={size} style={triggerStyle} className={triggerClass}>
          {icon}
          {icon ? <span className="ml-1">{label}</span> : label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? label}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {fields.length > 0 && (
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={`action-field-${f.name}`}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={`action-field-${f.name}`}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={`action-field-${f.name}`}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an option</option>
                    {f.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`action-field-${f.name}`}
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}