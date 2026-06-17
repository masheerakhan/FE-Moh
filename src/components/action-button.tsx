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
  type?: "text" | "textarea" | "number" | "email" | "tel";
  defaultValue?: string;
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
      if (!values[f.name]?.toString().trim()) {
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