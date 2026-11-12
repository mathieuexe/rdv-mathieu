"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Building2, Check, LoaderCircle } from "@/components/icons";

import { formatSiren, type CompanySuggestion } from "@/lib/company";
import { cn } from "@/lib/utils";

interface CompanyFieldProps {
  name: string;
  siren: string;
  onChange: (company: { name: string; siren: string }) => void;
  /** Classes du champ de saisie, pour reprendre le style du formulaire hôte. */
  inputClassName?: string;
  id?: string;
}

/**
 * Champ « Entreprise » : on tape un nom ou un SIREN, l'annuaire officiel
 * propose les sociétés correspondantes. Le choix d'une proposition est
 * facultatif : le nom peut toujours être saisi librement.
 */
export function CompanyField({ name, siren, onChange, inputClassName, id }: CompanyFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-suggestions`;
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Vrai tant que l'utilisateur tape : évite de relancer une recherche juste après un choix.
  const shouldSearch = useRef(false);

  useEffect(() => {
    const query = name.trim();

    if (!shouldSearch.current || query.length < 3) {
      setSuggestions([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/public/companies?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await response.json()) as { results?: CompanySuggestion[] };

        setSuggestions(data.results ?? []);
        setHasSearched(true);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setHasSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name]);

  function choose(suggestion: CompanySuggestion) {
    shouldSearch.current = false;
    onChange({ name: suggestion.name, siren: suggestion.siren });
    setIsOpen(false);
    setSuggestions([]);
  }

  const showList = isOpen && name.trim().length >= 3 && (suggestions.length > 0 || hasSearched);

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={inputId}
          value={name}
          onChange={(event) => {
            shouldSearch.current = true;
            // Toute modification manuelle invalide le SIREN précédemment choisi.
            onChange({ name: event.target.value, siren: "" });
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={(event) => {
            if (!showList || suggestions.length === 0) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % suggestions.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              choose(suggestions[activeIndex]);
            } else if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="organization"
          placeholder="Nom de la société ou SIREN"
          className={cn(inputClassName, "pr-10")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Building2 className="size-4" />}
        </span>
      </div>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.siren} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                // `mousedown` plutôt que `click` : le choix doit passer avant la perte de focus du champ.
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(suggestion);
                }}
                className={cn(
                  "block w-full px-4 py-2.5 text-left transition-colors hover:bg-slate-50",
                  index === activeIndex && "bg-slate-50",
                )}
              >
                <span className="block text-[15px] font-semibold text-slate-900">{suggestion.name}</span>
                <span className="block text-[13px] text-slate-500">
                  SIREN {formatSiren(suggestion.siren)}
                  {suggestion.location ? ` · ${suggestion.location}` : ""}
                </span>
              </button>
            </li>
          ))}
          {suggestions.length === 0 && !isLoading ? (
            <li className="px-4 py-2.5 text-[13px] text-slate-500">
              Aucune société trouvée. Vous pouvez garder le nom tel que vous l&apos;avez saisi.
            </li>
          ) : null}
        </ul>
      ) : null}

      {siren ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-emerald-700">
          <Check className="size-4" />
          Société identifiée · SIREN {formatSiren(siren)}
        </p>
      ) : null}
    </div>
  );
}
