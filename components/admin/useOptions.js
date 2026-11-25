"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/ui/api";

// Small cache of talent / clubs for dropdowns.
const cache = {};
export function useOptions(resource) {
  const [rows, setRows] = useState(cache[resource] || []);
  useEffect(() => {
    api(`/api/admin/r/${resource}`).then((d) => { cache[resource] = d.rows; setRows(d.rows); }).catch(() => {});
  }, [resource]);
  return rows;
}
