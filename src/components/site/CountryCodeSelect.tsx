import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COUNTRIES, countryByIso2, PRIORITY_ISO2, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

type Props = {
  /** ISO 3166-1 alpha-2 of the current selection. */
  value: string;
  onChange: (iso2: string) => void;
  /** Wired to the phone input so screen readers announce them as one control. */
  describedBy?: string | undefined;
  invalid?: boolean | undefined;
};

export function CountryCodeSelect({ value, onChange, describedBy, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const selected = countryByIso2(value);

  const { priority, rest } = useMemo(() => {
    const set = new Set<string>(PRIORITY_ISO2);
    const priority: Country[] = [];
    for (const iso2 of PRIORITY_ISO2) {
      const c = countryByIso2(iso2);
      if (c) priority.push(c);
    }
    return { priority, rest: COUNTRIES.filter((c) => !set.has(c.iso2)) };
  }, []);

  function select(iso2: string) {
    onChange(iso2);
    setOpen(false);
  }

  const renderItem = (c: Country) => (
    <CommandItem
      key={c.iso2}
      // cmdk matches on this string, so the dial code and ISO code are both
      // searchable — typing "971", "ae" or "emirates" all find the UAE.
      value={`${c.name} ${c.dial} ${c.iso2}`}
      onSelect={() => select(c.iso2)}
      className="gap-3 font-sans text-sm aria-selected:bg-accent/15"
    >
      <span aria-hidden className="text-base leading-none">
        {c.flag}
      </span>
      <span className="flex-1 truncate text-foreground">{c.name}</span>
      <span className="tabular-nums text-muted-foreground">{c.dial}</span>
      <Check
        className={cn("h-4 w-4 text-accent", c.iso2 === value ? "opacity-100" : "opacity-0")}
        strokeWidth={2}
      />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={
          selected
            ? `Country code: ${selected.name} ${selected.dial}. Change`
            : "Choose a country code"
        }
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="flex min-h-12 shrink-0 items-center gap-2 rounded-l-lg py-3 pl-4 pr-3 font-sans text-base text-foreground transition-colors duration-200 hover:bg-foreground/5 focus:outline-none focus-visible:bg-foreground/5"
      >
        <span aria-hidden className="text-base leading-none">
          {selected?.flag ?? "🏳️"}
        </span>
        <span className="tabular-nums">{selected?.dial ?? "+"}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2.5rem))] border-border p-0"
      >
        <Command
          // Default cmdk scoring reorders on substring hits; this keeps the
          // priority group pinned to the top until the user actually searches.
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search country or code" className="font-sans text-base" />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-6 text-center font-sans text-sm text-muted-foreground">
              No country found.
            </CommandEmpty>
            <CommandGroup
              heading="Corridor"
              className="[&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.02em] [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {priority.map(renderItem)}
            </CommandGroup>
            <CommandGroup
              heading="All countries"
              className="[&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.02em] [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {rest.map(renderItem)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
