import { Suspense } from "react";
import CitasContent from "./CitasContent";

export default function CitasPage() {
  return (
    <Suspense fallback={<div>Cargando citas...</div>}>
      <CitasContent />
    </Suspense>
  );
}