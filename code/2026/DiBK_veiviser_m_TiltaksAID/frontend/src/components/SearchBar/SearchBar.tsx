// Address search bar with autocomplete powered by the Geonorge address API.
// Uses debounced input to avoid excessive API calls, and displays matching
// addresses in a MUI Autocomplete dropdown. On selection, passes the chosen
// address (with coordinates and matrikkel number) back to the parent via callback.
import { useEffect, useState } from "react"
import { GetPropertyInformation } from "../../lib/map/getPlaces";
import useDebounce from "../../lib/useDebounce"
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
//import { IoSearch } from "react-icons/io5";

type AddressResult = {
  addressName: string;
  municipalityName: string;
  municipalityNumber: string;
  gnr: number | null;
  bnr: number | null;
  postnummer: string;
  lat: number | null;
  lon: number | null;
  matrikkelNumber: string;
};

export interface SearchBarProps { //Callback method for parent, returning an array
  onAddressSelect: (resultProps: AddressResult) => void;
}

export default function SearchBar({
  onAddressSelect
}: SearchBarProps) {

  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState<AddressResult | null>(null);
  const debouncedSearch = useDebounce(inputValue, 400)

  //const [error, setError] = useState("");


  useEffect(() => {
    if (!debouncedSearch || isSelecting) return

    const getData = async () => {

      const results = (await GetPropertyInformation(debouncedSearch)) ?? [];
      if (!results || results.length === 0) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      // normalize gnr and bnr to numbers and ensure matrikkelNumber is a string
      const normalized = results.map(r => ({
        addressName: r.addressName ?? "",
        municipalityName: r.municipalityName ?? "",
        municipalityNumber: r.municipalityNumber ?? "",
        gnr: typeof r.gnr === 'string' ? parseInt(r.gnr, 10) : (r.gnr ?? null),
        bnr: typeof r.bnr === 'string' ? parseInt(r.bnr, 10) : (r.bnr ?? null),
        postnummer: r.postnummer ?? "",
        lat: r.lat ?? null,
        lon: r.lon ?? null,
        matrikkelNumber: r.matrikkelNumber ?? "",
      } as AddressResult));

      setSuggestions(normalized);
      setOpen(true);
    };
    void getData();
  }, [debouncedSearch, onAddressSelect, isSelecting]);


  return (
    <div
      className="flex items-center gap-2 bg-primary p-0.5 x-lg shadow-sm"
    >
      <Autocomplete<AddressResult, false, false, true>
        className="w-65 text-black"
        freeSolo
        open={open && suggestions.length > 0}
        onClose={() => setOpen(false)}
        inputValue={inputValue}
        // onInputChange Fires when you type in the input field. Use this to update your search state.
        onInputChange={(_, value, reason) => {
          if (reason === "input") {
            setInputValue(value);
            setIsSelecting(false);
            setSelectedValue(null);
          }
        }}
        value={selectedValue}
        
        // onChange Fires when you select an option from the dropdown. Use this to finalize the selection.
        onChange={(_, value) => {
          if (typeof value === "string") {
            setInputValue(value);
            setSelectedValue(null);
            setIsSelecting(true);
            setOpen(false);
            return;
          }
          setSelectedValue(value);
          setInputValue(value?.addressName ?? "");
          setIsSelecting(true);
          if (value) {
            onAddressSelect(value);
          }
          setOpen(false);
        }}
        options={suggestions}
        // ...existing code...
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : `${option.addressName}, ${option.postnummer}`
        }
        isOptionEqualToValue={(option, value) => {
          if (typeof option === "string" || typeof value === "string") return false;
          return option.addressName === value.addressName && option.postnummer === value.postnummer;
        }}

        renderInput={(params) => (
          <TextField
            {...params}
            // label={<IoSearch />}
            size="small"
            autoComplete="off"
            placeholder="Søk adresse..."
            sx={{

              zIndex: 10000,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff'
              },
              '& .MuiInputLabel-root': {
                color: '#666'
              }
            }}
          />
        )}
      />

    </div>
  );
}
