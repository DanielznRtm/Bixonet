"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, RotateCcw, Send } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { amenityLabel } from "@/lib/republic/amenities";
import { createRepublic, updateRepublic } from "@/lib/registration/actions";
import {
  AMENITY_KEYS,
  EMPTY_REGISTRATION,
  type RegistrationInput,
  registrationSchema,
  STEP_FIELDS,
  STEPS,
} from "@/lib/registration/schema";
import { KIND_LABEL } from "@/lib/search/format";
import { cn } from "@/lib/utils";
import { PhotoUploader } from "./photo-uploader";

const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const DRAFT_KEY = "bixo:cadastro-rascunho";

export type WizardInstitution = {
  id: string;
  citySlug: string;
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  mode: "create" | "edit";
  republicId?: string;
  userId: string;
  cities: { slug: string; name: string; lat: number; lng: number }[];
  institutions: WizardInstitution[];
  initialValues?: RegistrationInput;
};

function readDraft(): RegistrationInput | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as RegistrationInput) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // sem localStorage (aba anônima etc.): nada a limpar
  }
}

export function RegistrationWizard({
  mode,
  republicId,
  userId,
  cities,
  institutions,
  initialValues,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSubmitting, startSubmit] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: initialValues ?? EMPTY_REGISTRATION,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, trigger, watch, setValue, reset, formState } =
    form;
  const errors = formState.errors as FieldErrors<Record<string, unknown>>;

  // Rascunho no navegador (só no cadastro novo): ninguém perde o que digitou se sair no meio.
  useEffect(() => {
    if (mode !== "create") return;
    const draft = readDraft();
    if (draft) {
      reset({ ...EMPTY_REGISTRATION, ...draft });
      setDraftRestored(true);
    }
    const sub = watch((values) => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // armazenamento cheio ou bloqueado: segue sem rascunho
      }
    });
    return () => sub.unsubscribe();
  }, [mode, reset, watch]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const citySlug = watch("citySlug");
  const lat = watch("lat");
  const lng = watch("lng");
  const cityInstitutions = institutions.filter((i) => i.citySlug === citySlug);
  const city = cities.find((c) => c.slug === citySlug) ?? cities[0];
  const isLast = step === STEPS.length - 1;

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startSubmit(async () => {
      const result =
        mode === "edit" && republicId
          ? await updateRepublic(republicId, values)
          : await createRepublic(values);
      if (!result.ok) {
        setServerError(result.message);
        return;
      }
      clearDraft();
      router.push(`/minhas-reps?${mode === "edit" ? "salvo" : "enviado"}=${result.slug}`);
    });
  });

  const fieldError = (name: string) => {
    const message = (errors[name] as { message?: string } | undefined)?.message;
    return message ? (
      <p
        id={`${name}-erro`}
        role="alert"
        className="text-sm font-medium text-destructive"
      >
        {message}
      </p>
    ) : null;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {draftRestored ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary p-3 text-sm">
          <span>Recuperamos o rascunho que você tinha começado.</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => {
              clearDraft();
              reset(EMPTY_REGISTRATION);
              setDraftRestored(false);
              setStep(0);
            }}
          >
            <RotateCcw aria-hidden className="size-3.5" />
            Começar do zero
          </Button>
        </div>
      ) : null}

      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          Etapa {step + 1} de {STEPS.length}
        </p>
        <Progress
          value={((step + 1) / STEPS.length) * 100}
          aria-label="Progresso do cadastro"
        />
        <ol className="hidden gap-2 text-xs text-muted-foreground sm:flex">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={cn("flex-1", i === step && "font-semibold text-foreground")}
            >
              {s.title}
            </li>
          ))}
        </ol>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold tracking-tight outline-none"
      >
        {STEPS[step].title}
      </h2>

      {/* Etapa 1 — Básico */}
      <fieldset hidden={step !== 0} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome da república</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ex.: Rep Jabuticaba"
            className="h-11"
          />
          {fieldError("name")}
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium" id="kind-label">
            Tipo
          </span>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <div
                role="radiogroup"
                aria-labelledby="kind-label"
                className="grid grid-cols-3 gap-2"
              >
                {(["male", "female", "mixed"] as const).map((k) => (
                  <label
                    key={k}
                    className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-border text-sm font-medium has-checked:border-primary has-checked:bg-secondary"
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={field.name}
                      value={k}
                      checked={field.value === k}
                      onChange={() => field.onChange(k)}
                      onBlur={field.onBlur}
                    />
                    {KIND_LABEL[k]}
                  </label>
                ))}
              </div>
            )}
          />
          {fieldError("kind")}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="totalResidents">Moradores (hoje)</Label>
            <Input
              id="totalResidents"
              type="number"
              inputMode="numeric"
              min={1}
              {...register("totalResidents")}
              className="h-11"
            />
            {fieldError("totalResidents")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="openSpots">Vagas abertas</Label>
            <Input
              id="openSpots"
              type="number"
              inputMode="numeric"
              min={0}
              {...register("openSpots")}
              className="h-11"
            />
            {fieldError("openSpots")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priceMin">Preço mínimo (R$/mês)</Label>
            <Input
              id="priceMin"
              type="number"
              inputMode="numeric"
              min={0}
              {...register("priceMin")}
              className="h-11"
            />
            {fieldError("priceMin")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priceMax">Preço máximo (R$/mês)</Label>
            <Input
              id="priceMax"
              type="number"
              inputMode="numeric"
              min={0}
              {...register("priceMax")}
              className="h-11"
            />
            {fieldError("priceMax")}
          </div>
        </div>
        <p className="-mt-2 text-sm text-muted-foreground">
          Se todos pagam o mesmo, use o mesmo valor nos dois campos.
        </p>
      </fieldset>

      {/* Etapa 2 — Onde fica */}
      <fieldset hidden={step !== 1} className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="citySlug">Cidade</Label>
            <Controller
              control={control}
              name="citySlug"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="citySlug" className="h-11 w-full">
                    <SelectValue placeholder="Escolha a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fieldError("citySlug")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              {...register("neighborhood")}
              placeholder="Ex.: Alto da Boa Vista"
              className="h-11"
            />
            {fieldError("neighborhood")}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Onde fica a casa</span>
          <p className="text-sm text-muted-foreground">
            Toque no mapa para marcar e arraste o pino para ajustar. No site, aparece só
            uma área de ~150 m: o endereço exato nunca é mostrado.
          </p>
          <div
            className="h-80 overflow-hidden rounded-2xl border border-border"
            data-testid="location-picker"
          >
            {step === 1 ? (
              <LocationPicker
                value={
                  typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null
                }
                onChange={(p) => {
                  setValue("lat", p.lat, { shouldValidate: true, shouldDirty: true });
                  setValue("lng", p.lng, { shouldValidate: true, shouldDirty: true });
                }}
                center={{ lat: city?.lat ?? -23.5, lng: city?.lng ?? -47.46 }}
                campuses={cityInstitutions.map((i) => ({
                  id: i.id,
                  name: i.name,
                  lat: i.lat,
                  lng: i.lng,
                }))}
              />
            ) : null}
          </div>
          {fieldError("lat") ?? fieldError("lng")}
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">
            Faculdades dos moradores (opcional)
          </legend>
          <Controller
            control={control}
            name="institutionIds"
            render={({ field }) => (
              <div className="grid gap-2 sm:grid-cols-2">
                {cityInstitutions.map((i) => {
                  const checked = field.value.includes(i.id);
                  return (
                    <label
                      key={i.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm has-checked:border-primary"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) =>
                          field.onChange(
                            c
                              ? [...field.value, i.id]
                              : field.value.filter((v) => v !== i.id),
                          )
                        }
                      />
                      {i.name}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </fieldset>
      </fieldset>

      {/* Etapa 3 — A casa */}
      <fieldset hidden={step !== 2} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="description">Sobre a casa</Label>
          <Textarea
            id="description"
            rows={5}
            {...register("description")}
            placeholder="Como é a casa, quem mora, o clima, o que tem por perto…"
          />
          <p className="text-xs text-muted-foreground">
            {watch("description")?.length ?? 0}/2000 caracteres
          </p>
          {fieldError("description")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="houseRules">Regras da casa (opcional)</Label>
          <Textarea
            id="houseRules"
            rows={3}
            {...register("houseRules")}
            placeholder="Visitas, silêncio, divisão de tarefas…"
          />
          {fieldError("houseRules")}
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">O que tem</legend>
          <Controller
            control={control}
            name="amenities"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AMENITY_KEYS.map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm has-checked:border-primary"
                  >
                    <Checkbox
                      checked={field.value.includes(key)}
                      onCheckedChange={(c) =>
                        field.onChange(
                          c
                            ? [...field.value, key]
                            : field.value.filter((v) => v !== key),
                        )
                      }
                    />
                    {amenityLabel(key)}
                  </label>
                ))}
              </div>
            )}
          />
        </fieldset>
      </fieldset>

      {/* Etapa 4 — Fotos */}
      <fieldset hidden={step !== 3} className="grid gap-5">
        <Controller
          control={control}
          name="photos"
          render={({ field }) => (
            <PhotoUploader
              userId={userId}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {fieldError("photos")}
      </fieldset>

      {/* Etapa 5 — Contato */}
      <fieldset hidden={step !== 4} className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contactName">Nome para contato</Label>
            <Input
              id="contactName"
              autoComplete="given-name"
              {...register("contactName")}
              className="h-11"
            />
            {fieldError("contactName")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(15) 99123-4567"
              {...register("whatsapp")}
              className="h-11"
            />
            {fieldError("whatsapp")}
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="instagram">Instagram da rep (opcional)</Label>
            <Input
              id="instagram"
              placeholder="@suarep"
              {...register("instagram")}
              className="h-11"
            />
            {fieldError("instagram")}
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl bg-surface p-4">
          <Controller
            control={control}
            name="consentResident"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(c) => field.onChange(c === true)}
                  aria-describedby="consentResident-erro"
                  className="mt-0.5"
                />
                Moro nesta república ou tenho autorização dos moradores para cadastrá-la.
              </label>
            )}
          />
          {fieldError("consentResident")}
          <Controller
            control={control}
            name="consentPublic"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(c) => field.onChange(c === true)}
                  aria-describedby="consentPublic-erro"
                  className="mt-0.5"
                />
                <span>
                  Autorizo exibir estas informações publicamente no bixo.net (nome,
                  bairro, área aproximada, fotos, WhatsApp e Instagram). Posso tirar a
                  república do ar quando quiser.{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Como usamos seus dados
                  </Link>
                </span>
              </label>
            )}
          />
          {fieldError("consentPublic")}
        </div>
      </fieldset>

      {serverError ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0 || isSubmitting}
          className="gap-1"
        >
          <ChevronLeft aria-hidden className="size-4" />
          Voltar
        </Button>
        {isLast ? (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 gap-2 rounded-full px-6 font-semibold"
          >
            <Send aria-hidden className="size-4" />
            {isSubmitting
              ? "Enviando…"
              : mode === "edit"
                ? "Salvar alterações"
                : "Enviar para análise"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={next}
            className="h-11 gap-1 rounded-full px-6 font-semibold"
          >
            Continuar
            <ChevronRight aria-hidden className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
